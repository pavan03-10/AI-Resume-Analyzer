from urllib.parse import urlparse

from fastapi import APIRouter, Header, HTTPException, Query

from app.services.supabase_service import (
    create_resume_signed_url,
    get_supabase,
)


router = APIRouter(
    prefix="/analyses",
    tags=["Analysis History"],
)


RESUME_BUCKET = "resumes"


# ============================================================
# Authentication
# ============================================================

def get_authenticated_user_id(
    authorization: str | None,
) -> str:
    """
    Validate the Supabase access token and return the
    authenticated user's UUID.
    """

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        response = get_supabase().auth.get_user(
            token.strip()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = getattr(response, "user", None)

    if user is None:
        data = getattr(response, "data", None)

        if isinstance(data, dict):
            user = data.get("user")

    user_id = getattr(user, "id", None)

    if user_id is None and isinstance(user, dict):
        user_id = user.get("id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Unable to identify the authenticated user.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return str(user_id)


# ============================================================
# Storage Path Normalization
# ============================================================

def normalize_storage_path(
    storage_path: str | None,
    bucket_name: str = RESUME_BUCKET,
) -> str | None:
    """
    Convert different Storage path formats into the actual
    Supabase Storage object path.

    Examples:

        user-id/file.pdf

        resumes/user-id/file.pdf

        /resumes/user-id/file.pdf

        https://project.supabase.co/storage/v1/object/public/
        resumes/user-id/file.pdf

        https://project.supabase.co/storage/v1/object/sign/
        resumes/user-id/file.pdf?token=...
    """

    if not storage_path:
        return None

    path = str(storage_path).strip()

    if not path:
        return None

    # --------------------------------------------------------
    # Full URL
    # --------------------------------------------------------

    if path.startswith("http://") or path.startswith(
        "https://"
    ):
        parsed = urlparse(path)

        path = parsed.path

        marker = "/storage/v1/object/"

        if marker in path:
            path = path.split(
                marker,
                1,
            )[1]

            parts = path.split(
                "/",
                1,
            )

            if len(parts) == 2:
                path = parts[1]

    # --------------------------------------------------------
    # Remove leading slash
    # --------------------------------------------------------

    path = path.lstrip("/")

    # --------------------------------------------------------
    # Remove bucket prefix
    # --------------------------------------------------------

    bucket_prefix = f"{bucket_name}/"

    if path.startswith(bucket_prefix):
        path = path[len(bucket_prefix):]

    path = path.lstrip("/")

    return path or None


# ============================================================
# Get User Analyses
# ============================================================

def get_user_analyses(
    user_id: str,
    limit: int,
):
    """
    Return analyses belonging only to the authenticated user.
    """

    response = (
        get_supabase()
        .table("analyses")
        .select(
            "id,user_id,resume_id,job_description,"
            "ats_score,match_score,breakdown,match_breakdown,"
            "summary,strengths,missing_skills,weaknesses,suggestions,"
            "created_at,"
            "resumes(filename,file_type,file_path)"
        )
        .eq(
            "user_id",
            user_id,
        )
        .order(
            "created_at",
            desc=True,
        )
        .limit(limit)
        .execute()
    )

    return response.data or []


# ============================================================
# Get One User Analysis
# ============================================================

def get_user_analysis(
    user_id: str,
    analysis_id: str,
):
    """
    Return one analysis only when it belongs to the
    authenticated user.
    """

    response = (
        get_supabase()
        .table("analyses")
        .select(
            "id,user_id,resume_id,job_description,"
            "ats_score,match_score,breakdown,match_breakdown,"
            "summary,strengths,missing_skills,weaknesses,suggestions,"
            "created_at,"
            "resumes(filename,file_type,file_path)"
        )
        .eq(
            "id",
            analysis_id,
        )
        .eq(
            "user_id",
            user_id,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# ============================================================
# LIST ANALYSES
# ============================================================

@router.get("/")
def list_analyses(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    authorization: str | None = Header(
        default=None,
    ),
):
    """
    Return recent analyses for the authenticated user.
    """

    user_id = get_authenticated_user_id(
        authorization
    )

    try:
        analyses = get_user_analyses(
            user_id=user_id,
            limit=limit,
        )

        return {
            "success": True,
            "count": len(analyses),
            "analyses": analyses,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch analysis history.",
        ) from exc


# ============================================================
# DELETE ACCOUNT
# ============================================================

@router.delete("/account")
def delete_account(
    authorization: str | None = Header(
        default=None,
    ),
):
    """
    Permanently delete the authenticated user's account,
    analyses, resumes, and Storage files.
    """

    user_id = get_authenticated_user_id(
        authorization
    )

    supabase = get_supabase()

    # --------------------------------------------------------
    # Get resume records first
    # --------------------------------------------------------

    try:
        resumes_response = (
            supabase
            .table("resumes")
            .select(
                "id,file_path"
            )
            .eq(
                "user_id",
                user_id,
            )
            .execute()
        )

        resumes = (
            resumes_response.data or []
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to prepare account deletion."
            ),
        ) from exc

    # --------------------------------------------------------
    # Normalize Storage paths
    # --------------------------------------------------------

    storage_paths = []

    for resume in resumes:
        if not isinstance(
            resume,
            dict,
        ):
            continue

        path = normalize_storage_path(
            resume.get("file_path"),
            RESUME_BUCKET,
        )

        if path:
            storage_paths.append(path)

    storage_paths = list(
        dict.fromkeys(storage_paths)
    )

    # --------------------------------------------------------
    # Delete analyses
    # --------------------------------------------------------

    try:
        (
            supabase
            .table("analyses")
            .delete()
            .eq(
                "user_id",
                user_id,
            )
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to delete your saved analyses."
            ),
        ) from exc

    # --------------------------------------------------------
    # Delete resume records
    # --------------------------------------------------------

    try:
        (
            supabase
            .table("resumes")
            .delete()
            .eq(
                "user_id",
                user_id,
            )
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to delete your resume records."
            ),
        ) from exc

    # --------------------------------------------------------
    # Delete Storage files
    # --------------------------------------------------------

    storage_warning = False

    if storage_paths:
        try:
            supabase.storage.from_(
                RESUME_BUCKET
            ).remove(
                storage_paths
            )

        except Exception as exc:
            print(
                "Account Storage cleanup warning:",
                exc,
            )

            storage_warning = True

    # --------------------------------------------------------
    # Delete Auth account
    # --------------------------------------------------------

    try:
        supabase.auth.admin.delete_user(
            user_id
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Your application data was deleted, "
                "but your authentication account could "
                "not be deleted."
            ),
        ) from exc

    response = {
        "success": True,
        "message": (
            "Your account has been permanently deleted."
        ),
    }

    if storage_warning:
        response[
            "storage_cleanup_warning"
        ] = (
            "Your account was deleted, but some "
            "Storage files may require cleanup."
        )

    return response


# ============================================================
# GET RESUME SIGNED URL
# ============================================================

@router.get("/{analysis_id}/resume-url")
def get_resume_signed_url(
    analysis_id: str,
    authorization: str | None = Header(
        default=None,
    ),
):
    """
    Generate a temporary signed URL for the resume attached
    to an authenticated user's analysis.
    """

    user_id = get_authenticated_user_id(
        authorization
    )

    try:
        analysis = get_user_analysis(
            user_id=user_id,
            analysis_id=analysis_id,
        )

        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found.",
            )

        resume = analysis.get(
            "resumes"
        )

        if isinstance(
            resume,
            list,
        ):
            resume = (
                resume[0]
                if resume
                else None
            )

        if not isinstance(
            resume,
            dict,
        ):
            raise HTTPException(
                status_code=404,
                detail=(
                    "Resume not found for this analysis."
                ),
            )

        storage_path = normalize_storage_path(
            resume.get("file_path"),
            RESUME_BUCKET,
        )

        if not storage_path:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Resume Storage path not found."
                ),
            )

        signed_url = create_resume_signed_url(
            storage_path=storage_path,
        )

        return {
            "success": True,
            "analysis_id": analysis_id,
            "filename": resume.get(
                "filename"
            ),
            "signed_url": signed_url,
            "expires_in": 3600,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to create resume preview URL."
            ),
        ) from exc


# ============================================================
# GET SINGLE ANALYSIS
# ============================================================

@router.get("/{analysis_id}")
def get_analysis(
    analysis_id: str,
    authorization: str | None = Header(
        default=None,
    ),
):
    """
    Return a single analysis belonging to the
    authenticated user.
    """

    user_id = get_authenticated_user_id(
        authorization
    )

    try:
        analysis = get_user_analysis(
            user_id=user_id,
            analysis_id=analysis_id,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch analysis.",
        ) from exc

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    return {
        "success": True,
        "analysis": analysis,
    }


# ============================================================
# DELETE SINGLE ANALYSIS
# ============================================================

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    authorization: str | None = Header(
        default=None,
    ),
):
    """
    Delete an analysis belonging to the authenticated user.

    The database relationship is the ownership check:

        analyses.user_id == authenticated user

    Once that succeeds, the linked resume is also known
    to belong to the same analysis/user.

    The exact Storage path stored with that resume is then
    removed.
    """

    user_id = get_authenticated_user_id(
        authorization
    )

    supabase = get_supabase()

    # ========================================================
    # 1. Find authenticated user's analysis
    # ========================================================

    analysis = get_user_analysis(
        user_id=user_id,
        analysis_id=analysis_id,
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found.",
        )

    # ========================================================
    # 2. Get linked resume
    # ========================================================

    resume = analysis.get(
        "resumes"
    )

    if isinstance(
        resume,
        list,
    ):
        resume = (
            resume[0]
            if resume
            else None
        )

    resume_id = analysis.get(
        "resume_id"
    )

    storage_path = None

    if isinstance(
        resume,
        dict,
    ):
        storage_path = normalize_storage_path(
            resume.get("file_path"),
            RESUME_BUCKET,
        )

    # ========================================================
    # 3. Delete analysis
    #
    # IMPORTANT:
    # We already verified:
    #
    # analysis.id == analysis_id
    # analysis.user_id == authenticated user
    #
    # Therefore we do NOT perform the incorrect
    # "<user_id>/" Storage path check here.
    # ========================================================

    try:
        (
            supabase
            .table("analyses")
            .delete()
            .eq(
                "id",
                analysis_id,
            )
            .eq(
                "user_id",
                user_id,
            )
            .execute()
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to delete the analysis."
            ),
        ) from exc

    # ========================================================
    # 4. Delete resume database record
    # ========================================================

    if resume_id:
        try:
            (
                supabase
                .table("resumes")
                .delete()
                .eq(
                    "id",
                    resume_id,
                )
                .eq(
                    "user_id",
                    user_id,
                )
                .execute()
            )

        except Exception as exc:
            print(
                "Resume database cleanup warning:",
                exc,
            )

    # ========================================================
    # 5. Delete PDF from Supabase Storage
    # ========================================================

    storage_warning = None

    if storage_path:
        try:
            supabase.storage.from_(
                RESUME_BUCKET
            ).remove(
                [storage_path]
            )

        except Exception as exc:
            print(
                "Storage deletion warning:",
                exc,
            )

            storage_warning = (
                "The analysis was deleted, but the "
                "resume file could not be removed "
                "from Storage automatically."
            )

    # ========================================================
    # 6. Return success
    # ========================================================

    response = {
        "success": True,
        "analysis_id": analysis_id,
        "resume_id": resume_id,
        "message": (
            "Analysis deleted successfully."
        ),
    }

    if storage_warning:
        response[
            "storage_cleanup_warning"
        ] = storage_warning

    return response
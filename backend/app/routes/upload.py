from pathlib import Path
import shutil
import traceback
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Header,
)

from app.services.resume_parser import extract_pdf_text
from app.services.gemini_service import analyze_resume
from app.services.supabase_service import (
    SUPABASE_ENABLED,
    get_supabase,
    save_analysis,
    save_resume,
    delete_resume_from_storage,
)


router = APIRouter(
    prefix="/upload",
    tags=["Resume Upload"],
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Keep this consistent with the frontend validation.
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

CHUNK_SIZE = 1024 * 1024  # 1 MB

MAX_JOB_DESCRIPTION_LENGTH = 20_000


def get_authenticated_user_id(
    authorization: str | None,
) -> str:
    """
    Verify the Supabase access token and return the authenticated
    user's UUID.

    Expected header:
        Authorization: Bearer <supabase_access_token>
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
    except Exception:
        # Do not expose authentication internals to the client.
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

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


async def save_uploaded_pdf(
    resume: UploadFile,
    destination: Path,
) -> int:
    """
    Stream the uploaded file to disk while enforcing the
    maximum file size.

    Returns:
        Number of bytes written.
    """

    total_size = 0

    try:
        with destination.open("wb") as buffer:
            while True:
                chunk = await resume.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Resume file is too large. "
                            "Please upload a PDF smaller than 10 MB."
                        ),
                    )

                buffer.write(chunk)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to save the uploaded resume.",
        ) from exc

    finally:
        await resume.close()

    return total_size


def validate_pdf_signature(
    file_path: Path,
) -> bool:
    """
    Basic PDF signature validation.

    A genuine PDF normally starts with:
        %PDF-
    """

    try:
        with file_path.open("rb") as file:
            header = file.read(5)

        return header == b"%PDF-"

    except Exception:
        return False


def cleanup_local_file(file_path: Path | None) -> None:
    """
    Safely remove the temporary local upload.
    """

    if file_path is None:
        return

    try:
        if file_path.exists():
            file_path.unlink()
    except Exception:
        # Cleanup should never crash the request.
        pass


def cleanup_saved_resume(
    resume_record: dict | None,
) -> None:
    """
    Best-effort cleanup if the resume was saved to Supabase
    but a later persistence step failed.
    """

    if not resume_record:
        return

    resume_id = resume_record.get("id")
    storage_path = resume_record.get("file_path")

    try:
        if storage_path:
            delete_resume_from_storage(storage_path)
    except Exception:
        traceback.print_exc()

    if resume_id and SUPABASE_ENABLED:
        try:
            (
                get_supabase()
                .table("resumes")
                .delete()
                .eq("id", resume_id)
                .execute()
            )
        except Exception:
            traceback.print_exc()


@router.post("/")
async def upload_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    authorization: str | None = Header(default=None),
):
    # ==========================================================
    # 1. Authenticate request
    # ==========================================================

    user_id = get_authenticated_user_id(
        authorization
    )

    # ==========================================================
    # 2. Validate uploaded file
    # ==========================================================

    original_filename = resume.filename or "resume.pdf"

    safe_original_filename = Path(
        original_filename
    ).name

    extension = Path(
        safe_original_filename
    ).suffix.lower()

    # The application currently supports PDF resumes.
    if extension != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF resume files are allowed.",
        )

    # Validate content type when provided.
    # We don't rely on MIME type alone because clients can spoof it.
    if resume.content_type not in (
        None,
        "",
        "application/pdf",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file must be a PDF.",
        )

    # ==========================================================
    # 3. Validate job description
    # ==========================================================

    cleaned_job_description = (
        job_description or ""
    ).strip()

    if not cleaned_job_description:
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty.",
        )

    if len(cleaned_job_description) > MAX_JOB_DESCRIPTION_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=(
                "Job description is too long. "
                "Please keep it under 20,000 characters."
            ),
        )

    # ==========================================================
    # 4. Create a unique temporary local filename
    # ==========================================================

    unique_name = (
        f"{uuid.uuid4().hex}_resume.pdf"
    )

    file_path = UPLOAD_DIR / unique_name

    resume_record = None

    try:
        # ======================================================
        # 5. Save upload with a hard 10 MB limit
        # ======================================================

        file_size = await save_uploaded_pdf(
            resume,
            file_path,
        )

        if file_size <= 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded resume file is empty.",
            )

        # ======================================================
        # 6. Validate actual PDF content
        # ======================================================

        if not validate_pdf_signature(file_path):
            raise HTTPException(
                status_code=400,
                detail=(
                    "The uploaded file is not a valid PDF. "
                    "Please upload a valid resume PDF."
                ),
            )

        # ======================================================
        # 7. Extract resume text
        # ======================================================

        try:
            resume_text = extract_pdf_text(
                str(file_path)
            )
        except Exception:
            traceback.print_exc()

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to read this PDF. "
                    "Please make sure the resume contains readable text."
                ),
            )

        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract readable text "
                    "from the resume."
                ),
            )

        # ======================================================
        # 8. Gemini AI analysis
        # ======================================================

        try:
            analysis = analyze_resume(
                resume_text=resume_text,
                job_description=cleaned_job_description,
            )

        except Exception:
            traceback.print_exc()

            raise HTTPException(
                status_code=502,
                detail=(
                    "The AI analysis service is temporarily "
                    "unavailable. Please try again."
                ),
            )

        if not isinstance(analysis, dict):
            raise HTTPException(
                status_code=502,
                detail=(
                    "The AI service returned an invalid "
                    "analysis response. Please try again."
                ),
            )

        # ======================================================
        # 9. Save to Supabase
        # ======================================================

        if SUPABASE_ENABLED:
            try:
                resume_record = save_resume(
                    filename=safe_original_filename,
                    file_type=extension,
                    file_path=str(file_path),
                    user_id=user_id,
                )

                analysis_record = save_analysis(
                    resume_id=resume_record["id"],
                    job_description=cleaned_job_description,
                    analysis=analysis,
                    user_id=user_id,
                )

            except Exception:
                traceback.print_exc()

                # If the resume was already uploaded to Storage
                # and the analysis insert failed, clean it up.
                cleanup_saved_resume(
                    resume_record
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "The analysis was completed, but "
                        "saving the result failed. Please try again."
                    ),
                )

        else:
            analysis_record = None

        # ======================================================
        # 10. Return successful response
        # ======================================================

        return {
            "success": True,
            "filename": safe_original_filename,
            "file_type": extension,
            "user_id": user_id,
            "resume_id": (
                resume_record["id"]
                if resume_record
                else None
            ),
            "analysis_id": (
                analysis_record["id"]
                if analysis_record
                else None
            ),
            "analysis": analysis,
            "persistence": {
                "enabled": SUPABASE_ENABLED,
                "saved": analysis_record is not None,
            },
        }

    finally:
        # ======================================================
        # 11. Always remove temporary local file
        # ======================================================

        cleanup_local_file(file_path)
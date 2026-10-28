import os
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from supabase import Client, create_client


# ============================================================
# Environment
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_ENABLED = (
    os.getenv("SUPABASE_ENABLED", "true").lower() == "true"
)

SUPABASE_RESUME_BUCKET = os.getenv(
    "SUPABASE_RESUME_BUCKET",
    "resumes",
)

_supabase: Optional[Client] = None


# ============================================================
# Supabase Client
# ============================================================

def get_supabase() -> Client:
    """Return the server-side Supabase client."""
    global _supabase

    if not SUPABASE_ENABLED:
        raise RuntimeError("Supabase persistence is disabled.")

    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is not configured.")

    if not SUPABASE_SECRET_KEY:
        raise RuntimeError("SUPABASE_SECRET_KEY is not configured.")

    if _supabase is None:
        _supabase = create_client(
            SUPABASE_URL,
            SUPABASE_SECRET_KEY,
        )

    return _supabase


# ============================================================
# Resume Storage
# ============================================================

def upload_resume_to_storage(
    *,
    local_file_path: str,
    filename: str,
    user_id: str,
    content_type: str = "application/pdf",
) -> str:
    """
    Upload a resume to the private Supabase Storage bucket.

    Returns the Storage object path, for example:
    user-id/uuid-resume.pdf
    """

    if not user_id:
        raise ValueError("user_id is required for resume storage.")

    file_path = Path(local_file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Resume file does not exist: {local_file_path}"
        )

    safe_filename = Path(filename).name.replace(" ", "_")

    unique_filename = f"{uuid.uuid4()}-{safe_filename}"

    storage_path = f"{user_id}/{unique_filename}"

    with file_path.open("rb") as file:
        get_supabase().storage.from_(
            SUPABASE_RESUME_BUCKET
        ).upload(
            path=storage_path,
            file=file,
            file_options={
                "content-type": content_type,
                "upsert": "false",
            },
        )

    return storage_path


def delete_resume_from_storage(
    storage_path: str,
) -> None:
    """Delete a resume from Supabase Storage."""

    if not storage_path:
        return

    get_supabase().storage.from_(
        SUPABASE_RESUME_BUCKET
    ).remove([storage_path])


def create_resume_signed_url(
    storage_path: str,
    expires_in: int = 3600,
) -> str:
    """
    Create a temporary URL for viewing/downloading
    a resume from the private bucket.
    """

    if not storage_path:
        raise ValueError("storage_path is required.")

    response = (
        get_supabase()
        .storage
        .from_(SUPABASE_RESUME_BUCKET)
        .create_signed_url(
            storage_path,
            expires_in,
        )
    )

    if isinstance(response, dict):
        signed_url = (
            response.get("signedURL")
            or response.get("signedUrl")
            or response.get("signed_url")
        )
    else:
        signed_url = getattr(
            response,
            "signed_url",
            None,
        )

    if not signed_url:
        raise RuntimeError(
            "Supabase did not return a signed resume URL."
        )

    return signed_url


# ============================================================
# Resume Persistence
# ============================================================

def save_resume(
    *,
    filename: str,
    file_type: str,
    file_path: str,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Upload the resume to Supabase Storage and save
    its metadata in PostgreSQL.
    """

    if not user_id:
        raise ValueError(
            "user_id is required when saving a resume."
        )

    content_type = (
        "application/pdf"
        if file_type.lower() == ".pdf"
        else "application/octet-stream"
    )

    storage_path = upload_resume_to_storage(
        local_file_path=file_path,
        filename=filename,
        user_id=user_id,
        content_type=content_type,
    )

    try:
        response = (
            get_supabase()
            .table("resumes")
            .insert(
                {
                    "user_id": user_id,
                    "filename": filename,
                    "file_type": file_type,
                    "file_path": storage_path,
                }
            )
            .select("*")
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Supabase did not return the created resume."
            )

        return response.data[0]

    except Exception:
        # Avoid leaving an orphaned file in Storage if
        # the database insert fails.
        try:
            delete_resume_from_storage(storage_path)
        except Exception:
            pass

        raise


# ============================================================
# Analysis Persistence
# ============================================================

def save_analysis(
    *,
    resume_id: str,
    job_description: str,
    analysis: Dict[str, Any],
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Save a completed AI analysis and return the created row."""

    response = (
        get_supabase()
        .table("analyses")
        .insert(
            {
                "user_id": user_id,
                "resume_id": resume_id,
                "job_description": job_description,
                "ats_score": analysis["ats_score"],
                "match_score": analysis["match_score"],
                "breakdown": analysis["breakdown"],
                "match_breakdown": analysis["match_breakdown"],
                "summary": analysis["summary"],
                "strengths": analysis["strengths"],
                "missing_skills": analysis["missing_skills"],
                "weaknesses": analysis["weaknesses"],
                "suggestions": analysis["suggestions"],
            }
        )
        .select("*")
        .execute()
    )

    if not response.data:
        raise RuntimeError(
            "Supabase did not return the created analysis."
        )

    return response.data[0]


# ============================================================
# Analysis History
# ============================================================

def get_recent_analyses(
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """Return recent analyses with linked resume metadata."""

    response = (
        get_supabase()
        .table("analyses")
        .select(
            "id,user_id,resume_id,job_description,"
            "ats_score,match_score,breakdown,match_breakdown,"
            "summary,strengths,missing_skills,weaknesses,"
            "suggestions,created_at,"
            "resumes(filename,file_type,file_path)"
        )
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return response.data or []


def get_analysis_by_id(
    analysis_id: str,
) -> Optional[Dict[str, Any]]:
    """Return one analysis and its linked resume metadata."""

    response = (
        get_supabase()
        .table("analyses")
        .select(
            "id,user_id,resume_id,job_description,"
            "ats_score,match_score,breakdown,match_breakdown,"
            "summary,strengths,missing_skills,weaknesses,"
            "suggestions,created_at,"
            "resumes(filename,file_type,file_path)"
        )
        .eq("id", analysis_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]
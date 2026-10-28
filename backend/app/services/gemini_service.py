import json
import os
import random
import re
import time

from dotenv import load_dotenv
from google import genai

from app.prompts.ats_prompt import ATS_PROMPT


# ============================================================
# Environment
# ============================================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", "4"))
BASE_RETRY_DELAY = float(os.getenv("GEMINI_RETRY_DELAY", "2"))


# ============================================================
# Gemini Client
# ============================================================

client = genai.Client(api_key=API_KEY)


# ============================================================
# Error / Retry Helpers
# ============================================================

def _extract_status_code(error):
    """Extract an HTTP-like status code from common SDK exceptions."""
    for attr in ("code", "status_code", "http_status"):
        value = getattr(error, attr, None)

        if isinstance(value, int):
            return value

        if isinstance(value, str) and value.isdigit():
            return int(value)

    match = re.search(
        r"\b(400|401|403|404|408|409|429|500|502|503|504)\b",
        str(error),
    )

    return int(match.group(1)) if match else None


def _is_retryable_error(error):
    """Return True for transient Gemini/API failures."""
    status_code = _extract_status_code(error)

    if status_code in {408, 429, 500, 502, 503, 504}:
        return True

    error_text = str(error).upper()

    retry_markers = (
        "UNAVAILABLE",
        "RESOURCE_EXHAUSTED",
        "SERVICE UNAVAILABLE",
        "TOO MANY REQUESTS",
        "INTERNAL SERVER ERROR",
        "BAD GATEWAY",
        "GATEWAY TIMEOUT",
        "TIMEOUT",
    )

    return any(marker in error_text for marker in retry_markers)


def _retry_delay(attempt):
    """Exponential backoff with a small random jitter."""
    return (BASE_RETRY_DELAY * (2 ** attempt)) + random.uniform(0, 1)


# ============================================================
# Response Parsing Helpers
# ============================================================

def _clean_json_response(text):
    """Remove markdown fences and extract the JSON object."""
    if not text:
        raise ValueError("Gemini returned an empty response.")

    cleaned = text.strip()

    cleaned = re.sub(
        r"^```json\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    match = re.search(r"\{[\s\S]*\}", cleaned)

    if not match:
        raise ValueError(
            "Gemini did not return a valid JSON object.\n\n"
            f"Response:\n{cleaned}"
        )

    return match.group(0)


def _validate_score(value, field_name):
    """Validate one integer score."""
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{field_name} must be an integer.")

    if not 0 <= value <= 100:
        raise ValueError(
            f"{field_name} must be between 0 and 100."
        )


def _validate_breakdown(data, section_name, required_fields):
    """Validate a nested score breakdown."""
    section = data.get(section_name)

    if not isinstance(section, dict):
        raise ValueError(
            f"{section_name} must be an object."
        )

    for field in required_fields:
        if field not in section:
            raise ValueError(
                f"{section_name} is missing required key: {field}"
            )

        _validate_score(
            section[field],
            f"{section_name}.{field}",
        )


def _validate_exact_list(data, key, expected_length=5):
    """Validate that a required field is an array with exactly five items."""
    value = data.get(key)

    if not isinstance(value, list):
        raise ValueError(f"{key} must be an array.")

    if len(value) != expected_length:
        raise ValueError(
            f"{key} must contain exactly {expected_length} items; "
            f"received {len(value)}."
        )

    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            raise ValueError(
                f"{key}[{index}] must be a non-empty string."
            )


def _validate_analysis(data):
    """Validate the exact JSON schema expected by the frontend."""
    if not isinstance(data, dict):
        raise ValueError("Gemini response must be a JSON object.")

    required_keys = [
        "ats_score",
        "match_score",
        "breakdown",
        "match_breakdown",
        "summary",
        "strengths",
        "missing_skills",
        "weaknesses",
        "suggestions",
    ]

    missing = [
        key for key in required_keys
        if key not in data
    ]

    if missing:
        raise ValueError(
            f"Gemini JSON is missing required keys: {missing}"
        )

    # --------------------------------------------------------
    # Main scores
    # --------------------------------------------------------

    _validate_score(
        data["ats_score"],
        "ats_score",
    )

    _validate_score(
        data["match_score"],
        "match_score",
    )

    # --------------------------------------------------------
    # ATS breakdown
    # --------------------------------------------------------

    _validate_breakdown(
        data,
        "breakdown",
        (
            "formatting",
            "keywords",
            "readability",
            "sections",
        ),
    )

    # --------------------------------------------------------
    # Job match breakdown
    # --------------------------------------------------------

    _validate_breakdown(
        data,
        "match_breakdown",
        (
            "skills",
            "keywords",
            "experience",
            "education",
        ),
    )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    if not isinstance(data["summary"], str):
        raise ValueError("summary must be a string.")

    if not data["summary"].strip():
        raise ValueError("summary cannot be empty.")

    # --------------------------------------------------------
    # Required lists: exactly five
    # --------------------------------------------------------

    _validate_exact_list(data, "strengths")
    _validate_exact_list(data, "missing_skills")
    _validate_exact_list(data, "weaknesses")
    _validate_exact_list(data, "suggestions")

    return data


# ============================================================
# Gemini Request
# ============================================================

def _generate_with_retry(prompt):
    """Call Gemini with exponential-backoff retry protection."""
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            print(
                f"Gemini request attempt "
                f"{attempt + 1}/{MAX_RETRIES} "
                f"using model: {MODEL_NAME}"
            )

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )

            return response

        except Exception as error:
            last_error = error
            status_code = _extract_status_code(error)

            if not _is_retryable_error(error):
                raise RuntimeError(
                    f"Gemini API Error: {error}"
                ) from error

            if attempt == MAX_RETRIES - 1:
                break

            delay = _retry_delay(attempt)

            print(
                f"Gemini transient error "
                f"(status={status_code}). "
                f"Retrying in {delay:.1f}s..."
            )

            time.sleep(delay)

    raise RuntimeError(
        "Gemini is temporarily unavailable after "
        f"{MAX_RETRIES} attempts. "
        "Please try again in a few moments."
    ) from last_error


# ============================================================
# Public Analysis Function
# ============================================================

def analyze_resume(resume_text: str, job_description: str):
    """Analyze a resume against a job description and return validated data."""
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty.")

    if not job_description or not job_description.strip():
        raise ValueError("Job description is empty.")

    prompt = ATS_PROMPT.format(
        resume=resume_text.strip(),
        job_description=job_description.strip(),
    )

    print("\n========== GEMINI ANALYSIS ==========\n")
    print(f"Model: {MODEL_NAME}")
    print(f"Resume characters: {len(resume_text)}")
    print(f"Job description characters: {len(job_description)}")
    print("\n=====================================\n")

    response = _generate_with_retry(prompt)

    result = getattr(response, "text", None)

    if not result:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    print("\n========== RAW GEMINI RESPONSE ==========\n")
    print(result)
    print("\n==========================================\n")

    # --------------------------------------------------------
    # JSON extraction
    # --------------------------------------------------------

    json_text = _clean_json_response(result)

    print("\n========== JSON TO PARSE ==========\n")
    print(json_text)
    print("\n===================================\n")

    try:
        data = json.loads(json_text)

    except json.JSONDecodeError as error:
        raise ValueError(
            f"Invalid JSON returned by Gemini: {error}\n\n"
            f"Response:\n{json_text}"
        ) from error

    # --------------------------------------------------------
    # Strict schema validation
    # --------------------------------------------------------

    data = _validate_analysis(data)

    print("\n========== FINAL PARSED DATA ==========\n")
    print(
        json.dumps(
            data,
            indent=2,
            ensure_ascii=False,
        )
    )
    print("\n=======================================\n")

    return data
import fitz
from pathlib import Path

from app.utils.text_cleaner import clean_resume_text


def extract_pdf_text(pdf_path: str) -> str:
    """
    Extract text from PDF and clean it.
    """

    pdf_file = Path(pdf_path)

    if not pdf_file.exists():
        raise FileNotFoundError(f"{pdf_path} not found.")

    text = ""

    document = fitz.open(pdf_file)

    for page in document:
        text += page.get_text()

    document.close()

    return clean_resume_text(text)
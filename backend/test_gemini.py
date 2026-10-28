import os
import sys

from dotenv import load_dotenv
from google import genai


def main():
    load_dotenv()

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("ERROR: GEMINI_API_KEY is missing from backend/.env")
        sys.exit(1)

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents="Say hello",
        )

        print("Gemini API connection successful.")
        print("Response:", response.text)

    except Exception as exc:
        print(f"Gemini API test failed: {type(exc).__name__}: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
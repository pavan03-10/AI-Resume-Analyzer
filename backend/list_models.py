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

        print("\nAvailable Gemini Models:\n")

        for model in client.models.list():
            print(model.name)

    except Exception as exc:
        print(f"Unable to list models: {type(exc).__name__}: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
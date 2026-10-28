import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    for model in genai.list_models():
        print(model.name)
except Exception as e:
    print(e)
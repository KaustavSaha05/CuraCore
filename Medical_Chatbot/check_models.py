import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure the API key
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file.")
    
    genai.configure(api_key=api_key)

    print("Available models that support 'generateContent':")
    for m in genai.list_models():
      if 'generateContent' in m.supported_generation_methods:
        print(m.name)

except Exception as e:
    print(f"An error occurred: {e}")
    print("Please ensure your GOOGLE_API_KEY in the .env file is correct and has the 'Vertex AI User' role in your Google Cloud project.")


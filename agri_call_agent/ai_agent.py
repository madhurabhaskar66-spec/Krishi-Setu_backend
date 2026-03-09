import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# IMPORTANT: Keep your API key only in .env file
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY","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")

def get_ai_response(user_message):

    if not OPENROUTER_API_KEY:
        return "[en-IN] API key is missing. Please check configuration."

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Agri Voice Assistant"
    }

    data = {
        # Free and stable model
        "model": "openai/gpt-3.5-turbo",

        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a friendly agriculture expert assistant for farmers.\n\n"
                    "STRICT RULES:\n"
                    "1. Detect the user's language and ALWAYS reply in the SAME language.\n"
                    "2. Prefix response with correct BCP 47 language code in square brackets.\n"
                    "   Example: [kn-IN], [hi-IN], [en-IN], [te-IN], etc.\n"
                    "3. Answer in MAXIMUM 2 short sentences.\n"
                    "4. Keep response under 25 words.\n"
                    "5. Use very simple words that farmers understand.\n"
                    "6. Be polite, supportive, and respectful.\n"
                )
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        "temperature": 0.5
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        result = response.json()

        print("STATUS:", response.status_code)
        print("RESPONSE:", result)

        if response.status_code == 200 and "choices" in result:
            reply = result["choices"][0]["message"]["content"].strip()
            return reply
        else:
            error_msg = result.get("error", {}).get("message", "Unknown error")
            return f"[en-IN] Sorry, AI service error: {error_msg}"

    except Exception as e:
        print("ERROR:", str(e))
        return "[en-IN] Sorry, connection error. Please try again."
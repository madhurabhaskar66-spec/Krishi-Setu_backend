import requests
import os
from dotenv import load_dotenv

# Load environment variables from parent directory
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

# Get API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()


def get_ai_response(user_message):

    # Check API key
    if not OPENROUTER_API_KEY:
        return "[en-IN] API key is missing. Please check configuration."

    # OpenRouter endpoint
    url = "https://openrouter.ai/api/v1/chat/completions"

    # Headers
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Krishi Setu AI Assistant"
    }

    # Free fallback models
    models_to_try = [
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3-8b-instruct:free",
        "huggingfaceh4/zephyr-7b-beta:free",
        "mistralai/mistral-7b-instruct:free"
    ]

    # Try models one by one
    for model in models_to_try:

        print(f"\nTrying model: {model}")

        data = {
            "model": model,

            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a friendly agriculture expert assistant for farmers.\n\n"

                        "STRICT RULES:\n"

                        "1. Detect the user's language and ALWAYS reply in the SAME language.\n"

                        "2. Prefix response with correct BCP 47 language code in square brackets.\n"
                        "Examples:\n"
                        "[kn-IN] for Kannada\n"
                        "[hi-IN] for Hindi\n"
                        "[en-IN] for English\n"
                        "[te-IN] for Telugu\n"

                        "3. Answer in MAXIMUM 2 short sentences.\n"

                        "4. Keep response under 25 words.\n"

                        "5. Use very simple farmer-friendly words.\n"

                        "6. Be polite and supportive.\n"

                        "7. Only answer agriculture-related questions.\n"
                    )
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],

            "temperature": 0.5,
            "max_tokens": 60
        }

        try:

            response = requests.post(
                url,
                headers=headers,
                json=data,
                timeout=15
            )

            print("STATUS:", response.status_code)
            print("RAW RESPONSE:", response.text)

            result = response.json()

            # Success
            if response.status_code == 200 and "choices" in result:

                reply = result["choices"][0]["message"]["content"].strip()

                print("SUCCESSFUL MODEL:", model)
                print("AI REPLY:", reply)

                return reply

            else:

                error_msg = result.get(
                    "error",
                    {}
                ).get(
                    "message",
                    "Unknown error"
                )

                print(f"Model {model} failed:")
                print(error_msg)

        except Exception as e:

            print(f"Exception with model {model}:")
            print(str(e))

            continue

    # If all models fail
    return "[en-IN] Sorry, all free AI models are busy right now. Please try again later."


# Optional testing
if __name__ == "__main__":

    while True:

        user_input = input("\nAsk Farmer AI: ")

        if user_input.lower() == "exit":
            break

        response = get_ai_response(user_input)

        print("\nAI:", response)
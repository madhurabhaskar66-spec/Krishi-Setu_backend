from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from ai_agent import get_ai_response
import edge_tts

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

class Message(BaseModel):
    message: str

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
def chat(data: Message):
    reply = get_ai_response(data.message)
    return {"reply": reply}

async def generate_audio_stream(text: str, voice: str, rate: str):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]

@app.get("/tts")
async def get_tts(text: str, lang: str = "en-IN", speed: str = "normal"):
    voices = {
        "en-IN": "en-IN-NeerjaNeural",
        "hi-IN": "hi-IN-SwaraNeural",
        "te-IN": "te-IN-ShrutiNeural",
        "ta-IN": "ta-IN-PallaviNeural",
        "kn-IN": "kn-IN-SapnaNeural",
        "ml-IN": "ml-IN-SobhanaNeural",
        "mr-IN": "mr-IN-ArohiNeural",
        "bn-IN": "bn-IN-TanishaaNeural",
        "gu-IN": "gu-IN-DhwaniNeural",
        "pa-IN": "pa-IN-OjasNeural",
        "or-IN": "hi-IN-SwaraNeural", # Odia default fallback 
        "ur-IN": "ur-IN-GulNeural",
    }
    voice = voices.get(lang.strip().split('-')[0] + "-IN", "en-IN-NeerjaNeural") 
    if lang in voices:
        voice = voices[lang]
        
    rate = "+0%"
    if speed == "fast":
        rate = "+20%"
    elif speed == "slow":
        rate = "-20%"
        
    return StreamingResponse(generate_audio_stream(text, voice, rate), media_type="audio/mpeg")
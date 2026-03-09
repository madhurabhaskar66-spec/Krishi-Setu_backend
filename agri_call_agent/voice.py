import asyncio
import edge_tts

async def generate_voice(text):
    voice = "en-US-AriaNeural"  # Female robotic AI voice

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save("response.mp3")
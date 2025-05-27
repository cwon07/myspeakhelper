from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import openai

#load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(
    title="MySpeakerHelper API",
    description="Your personal AI-powered English communication helper",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class TextRequest(BaseModel):
    text: str

class EmailRequest(BaseModel):
    email: str
    tone: str = "professional"

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "en"

# endpoint: improve email tone and grammar
@app.post("/email-check")
async def email_check(req: EmailRequest):
    prompt = f"Hey! Can you rewrite this email to sound business-casual and friendly, fixing the grammar?\n\n{req.email}"
    try:
        resp = openai.ChatCompetion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a friendly, easy-going assistant who writes like a helpful friend."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        return {"improved_email": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# endpoint: translate text    
@app.post("/translate")
async def translate(req: TranslateRequest):
    prompt =f"Translate the following text to {req.target_language}, preserving nuances:\n\n{req.text}"
    try:
        resp = openai.ChatCompetion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
        )
        return {"translation": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# endpoint: common phrases for everyday scenarios
@app.get("/common-phrases")
async def common_phrases():
    return {
        "greetings": [
            "Hello! How can I help you today?",
            "Good morning/afternoon/evening!",
        ],
        "introductions": [
            "My name is ..., nice to meet you.",
            "I work as a ... at ...",
        ],
        "phone_expressions": [
            "Could you please repeat that?",
            "May I put you on hold for a moment?",
        ],
        "customer_service": [
            "I apologize for any inconvenience.",
            "Let me see how I can assist you.",
        ],
        "email_signoffs": [
            "Best regards,",
            "Sincerely,",
        ],
    }

# endpoint: speech-to-text using Whisper
@app.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    content = await file.read()
    try:
        resp = openai.Audio.transcribe("whisper-1", content)
        return {"transcript": resp["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# endpoint: interactive speaking practice
@app.post("/speaking-practice")
async def speaking_practice(req: TextRequest):
    prompt = f"Simulate this scenario and respond as a conversation partner for speaking practice:\n\n{req.text}"
    try:
        resp = openai.ChatCompetion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a patient, friendly conversational partner helping with pronunciation and word choice."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
        )
        return {"response": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return{"message": "Welcome to MySpeakerHelper API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
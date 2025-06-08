from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import Client
from app.utils.supabase_auth import get_current_user, supabase
import openai
import json
import re
import uvicorn
from io import BytesIO

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

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

class PracticeEntryIn(BaseModel):
    prompt: str
    response: str

class TextRequest(BaseModel):
    text: str

class EmailRequest(BaseModel):
    email: str
    tone: str = "professional"

class GenerateRequest(BaseModel):
    query: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "en"

@app.post("/practice-history", status_code=201)
async def create_practice_entry(
    entry: PracticeEntryIn,
    user=Depends(get_current_user),
):
    """
    Save a new practice entry to Supabase.
    The RLS policy ensures only this user's entries get inserted under their own user_id.
    """
    data = {
        "user_id": user.id,
        "prompt": entry.prompt,
        "response": entry.response,
    }
    res = supabase.table("practice_history").insert(data).execute()
    if res.error:
        raise HTTPException(status_code=500, detail=res.error.message)
    return {"status":"ok", "entry": res.data[0]}

# endpoint: improve email tone and grammar
@app.post("/email-check")
async def email_check(req: EmailRequest):
    prompt = f"Hey! Can you rewrite this email to sound business-casual and friendly, fixing the grammar?\n\n{req.email}"
    try:
        resp = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a friendly, easy-going assistant who writes like a helpful friend."
                },
                {
                    "role": "user", 
                    "content": prompt
                },
            ],
            temperature=0.7,
        )
        return {"improved_email": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# endpoint: translate text    
@app.post("/translate")
async def translate(req: TranslateRequest):
    prompt =(
                f"Translate the following text to {req.target_language}, "
                f" preserving nuances and context:\n\n{req.text}"
    )
    try:
        resp = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful assistant that translates text into English."
                },
                {
                    "role": "user", 
                    "content": prompt
                },
            ],
            temperature=0.7,
        )
        return {"translation": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#endpoint: generate phrases for user specified situations


@app.post("/generate-phrases")
async def generate_phrases(req: GenerateRequest):
    """
    Given a user-typed situation(like "refund policy"), ask GPT-4 to return 5-7 useful English phrases that someone in that situation could use.
    """
    prompt = (
        "You are a friendly language assistant."
        "Provide exactly 5 short, polite, culturally appropriate English phrases"
        f"someone could say or write when they want to {req.query}."
        "Return your answer as a JSON array of strings, nothing else."
    )

    try:
        resp = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for English communication."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=120
        )
        raw = resp.choices[0].message.content.strip()

        try:
            phrases_list = json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\[.*\]", raw, re.DOTALL)
            if not match:
                raise ValueError("GPT response not in expected JSON-array format.")
            phrases_list = json.loads(match.group(0))
        
        return {"phrases": phrases_list}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating phrases: {str(e)}")
    
# endpoint: speech-to-text using Whisper
@app.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        raw_bytes = await file.read()
        audio_file = BytesIO(raw_bytes)
        audio_file.name = file.filename
        
        resp = openai.audio.transcriptions.create(
            file=audio_file,
            model="whisper-1"
        )

        return { "transcript": resp.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# endpoint: interactive speaking practice
@app.post("/speaking-practice")
async def speaking_practice(req: TextRequest):
    prompt = f"Simulate this scenario and respond as a conversation partner for speaking practice:\n\n{req.text}"
    try:
        resp = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a patient, friendly conversational partner helping with pronunciation and word choice."
                },
                {
                    "role": "user", 
                    "content": prompt
                },
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
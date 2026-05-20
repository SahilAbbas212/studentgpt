from fastapi import APIRouter
from pydantic import BaseModel
from app.ai.groq_service import generate_notes
import json
import re

router = APIRouter()

class QuizRequest(BaseModel):
    text: str
    difficulty: str
    count: int

def repair_json(raw):
    """Try to salvage partial JSON by cutting off at last complete object"""
    try:
        # find last complete }
        last_complete = raw.rfind("},")
        if last_complete == -1:
            last_complete = raw.rfind("}")
        if last_complete == -1:
            return None
        trimmed = raw[:last_complete + 1] + "]"
        # fix opening bracket
        start = trimmed.find("[")
        trimmed = trimmed[start:]
        return json.loads(trimmed)
    except:
        return None

@router.post("/")
async def generate_quiz(data: QuizRequest):

    # trim text to avoid token overflow
    text = data.text[:2000]

    prompt = f"""You are a quiz generator. Generate EXACTLY {data.count} MCQ questions from the text below.
Difficulty level: {data.difficulty}

STRICT RULES:
- Generate EXACTLY {data.count} questions.
- Each question must have exactly 4 short options (keep options under 60 characters each).
- Return ONLY a valid JSON array. No extra text, no markdown.
- Keep all text short to avoid hitting length limits.

JSON format:
[
  {{
    "question": "question text",
    "options": ["option1", "option2", "option3", "option4"],
    "answer": "correct option",
    "explanation": "short explanation"
  }}
]

TEXT:
{text}

Return EXACTLY {data.count} questions as a complete valid JSON array."""

    try:
        raw_response = generate_notes(prompt)
        print("RAW:", raw_response[:300])

        raw_response = raw_response.replace("```json", "").replace("```", "").strip()

        start = raw_response.find("[")
        end = raw_response.rfind("]") + 1

        if start == -1:
            raise ValueError("No JSON found")

        json_text = raw_response[start:end] if end > start else raw_response[start:]

        # try full parse first
        try:
            quiz = json.loads(json_text)
        except json.JSONDecodeError:
            print("Full parse failed, trying repair...")
            quiz = repair_json(raw_response[start:])
            if not quiz:
                raise ValueError("JSON repair failed")

        print(f"Requested: {data.count}, Got: {len(quiz)}")
        return {"quiz": quiz}

    except Exception as e:
        print("QUIZ ERROR:", e)
        return {
            "quiz": [
                {
                    "question": "Quiz generation failed. Please try with shorter text.",
                    "options": ["Try again", "Use shorter text", "Reduce MCQ count", "Upload smaller file"],
                    "answer": "Use shorter text",
                    "explanation": "The AI response was too long. Try uploading a shorter document."
                }
            ]
        }
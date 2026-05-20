from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.groq_service import generate_notes

from app.database import SessionLocal
from app.models.analytics import Analytics

router = APIRouter()

class FlashcardRequest(BaseModel):
    text: str

@router.post("/")
async def create_flashcards(data: FlashcardRequest):

    text = data.text[:4000]

    prompt = f"""
Generate ONLY 10 concise educational flashcards.

Rules:
- No markdown
- No headings
- One concept per card
- Keep answers short
- Maximum 2 lines per answer

Format:

Q: Question here
A: Answer here

Text:
{text}
"""

    flashcards = generate_notes(prompt)

    # SAVE ANALYTICS
    db = SessionLocal()

    activity = Analytics(
        feature="Flashcards",
        minutes=5
    )

    db.add(activity)
    db.commit()
    db.close()

    return {
        "flashcards": flashcards
    }
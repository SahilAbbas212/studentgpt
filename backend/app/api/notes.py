from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.groq_service import generate_notes
from app.database import SessionLocal
from app.models.analytics import Analytics

router = APIRouter()

class NotesRequest(BaseModel):
    text: str

@router.post("/")
def create_notes(data: NotesRequest):

    # LIMIT INPUT FOR SPEED
    text = data.text[:5000]

    prompt = f"""
You are StudentGPT, an elite AI study assistant.

Create PREMIUM STUDY NOTES from the provided text.

RULES:
- Use BEAUTIFUL MARKDOWN formatting
- Use proper headings and subheadings
- Use bullet points
- Keep notes concise but detailed
- Highlight important concepts
- Add examples where useful
- Make content exam-friendly
- Keep response structured and clean

FORMAT STYLE:

# MAIN TOPIC

## Definition
> Important definition here

## Key Points
- Point 1
- Point 2

## Features
- Feature 1
- Feature 2

## Examples
- Example 1

## Summary
Short revision summary.

TEXT:
{text}
"""

    # GENERATE NOTES
    notes = generate_notes(prompt)

    # SAVE ANALYTICS
    db = SessionLocal()

    try:
        activity = Analytics(
            feature="Notes",
            minutes=10
        )

        db.add(activity)
        db.commit()

    except Exception as e:
        print("Analytics save error:", e)

    finally:
        db.close()

    return {
        "notes": notes
    }
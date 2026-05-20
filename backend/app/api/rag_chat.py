from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.groq_service import generate_notes

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.post("/")
async def chat(data: ChatRequest):

    question = data.question

    context = ""

    prompt = f"""
You are StudentGPT, an intelligent AI study assistant.

Answer educational questions clearly.

Rules:
- Use headings
- Use bullet points
- Use simple explanations
- Use markdown formatting
- Keep answers concise

Question:
{question}
"""

    answer = generate_notes(prompt)

    return {
        "answer": answer
    }
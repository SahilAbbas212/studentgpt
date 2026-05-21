from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, notes, flashcards, quiz, rag_chat, timetable, upload, analytics
from app.database import Base, engine
from app.api.analytics import QuizResult, SessionLog

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router,        prefix="/api/auth")
app.include_router(notes.router,       prefix="/api/notes")
app.include_router(flashcards.router,  prefix="/api/flashcards")
app.include_router(quiz.router,        prefix="/api/quiz")
app.include_router(rag_chat.router,    prefix="/api/chat")
app.include_router(timetable.router,   prefix="/api/timetable")
app.include_router(upload.router,      prefix="/api/upload")
app.include_router(analytics.router,   prefix="/api/analytics")

@app.get("/")
def home():
    return {"message": "StudentGPT Backend Running"}
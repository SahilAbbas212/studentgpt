from fastapi import APIRouter, Depends, Request
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from collections import defaultdict
from jose import jwt, JWTError

from app.database import Base, SessionLocal, engine

router = APIRouter()

SECRET_KEY = "studentgptsecret"
ALGORITHM  = "HS256"

# ─── DB MODELS ────────────────────────────────────
class QuizResult(Base):
    __tablename__ = "quiz_results"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, default=1)
    subject    = Column(String, default="General")
    score      = Column(Integer)
    total      = Column(Integer)
    percentage = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class SessionLog(Base):
    __tablename__ = "session_logs"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, default=1)
    page             = Column(String)
    duration_seconds = Column(Integer)
    created_at       = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ─── REQUEST MODELS ───────────────────────────────
class QuizResultRequest(BaseModel):
    subject: str = "General"
    score: int
    total: int

class SessionLogRequest(BaseModel):
    page: str
    duration_seconds: int

# ─── HELPERS ──────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_id(request: Request) -> int:
    try:
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id", 1)
    except JWTError:
        return 1

# ─── SAVE QUIZ RESULT ─────────────────────────────
@router.post("/quiz-result")
async def save_quiz_result(
    data: QuizResultRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id    = get_user_id(request)
    percentage = round((data.score / data.total) * 100) if data.total > 0 else 0
    result = QuizResult(
        user_id    = user_id,
        subject    = data.subject,
        score      = data.score,
        total      = data.total,
        percentage = percentage,
    )
    db.add(result)
    db.commit()
    return {"message": "Quiz result saved"}

# ─── SAVE SESSION LOG ─────────────────────────────
@router.post("/session-log")
async def save_session_log(
    data: SessionLogRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_user_id(request)
    log = SessionLog(
        user_id          = user_id,
        page             = data.page,
        duration_seconds = data.duration_seconds,
    )
    db.add(log)
    db.commit()
    return {"message": "Session logged"}

# ─── GET ANALYTICS SUMMARY ────────────────────────
@router.get("/")
async def get_analytics(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_user_id(request)

    # ── Quiz stats ──────────────────────────────
    quizzes       = db.query(QuizResult).filter(QuizResult.user_id == user_id).all()
    total_quizzes = len(quizzes)
    avg_score     = round(sum(q.percentage for q in quizzes) / total_quizzes) if total_quizzes > 0 else 0

    # ── Recent quizzes (last 10) ─────────────────
    recent_quizzes = []
    for q in sorted(quizzes, key=lambda x: x.created_at, reverse=True)[:10]:
        recent_quizzes.append({
            "subject"    : q.subject,
            "date"       : q.created_at.strftime("%Y-%m-%d"),
            "score"      : q.score,
            "total"      : q.total,
            "percentage" : round(q.percentage),
        })

    # ── Subject distribution ─────────────────────
    subject_counts = defaultdict(int)
    for q in quizzes:
        subject_counts[q.subject] += 1
    subject_data = [{"name": k, "value": v} for k, v in subject_counts.items()]

    # ── Session logs ─────────────────────────────
    logs = db.query(SessionLog).filter(SessionLog.user_id == user_id).all()

    # Page time in minutes (exclude non-feature pages)
    excluded_pages = {"Dashboard", "Analytics"}
    page_seconds   = defaultdict(int)
    for log in logs:
        if log.page not in excluded_pages:
            page_seconds[log.page] += log.duration_seconds
    page_time = [
        {"page": page, "minutes": round(secs / 60, 1)}
        for page, secs in sorted(page_seconds.items(), key=lambda x: x[1], reverse=True)
    ]

    # ── Weekly study hours (last 7 days) ─────────
    day_names  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today      = datetime.utcnow().date()
    weekly_map = defaultdict(float)

    for log in logs:
        log_date = log.created_at.date()
        diff     = (today - log_date).days
        if 0 <= diff < 7:
            day_key = log.created_at.weekday()
            weekly_map[day_key] += log.duration_seconds / 3600

    weekly_data = []
    for i in range(6, -1, -1):
        day      = today - timedelta(days=i)
        day_idx  = day.weekday()
        weekly_data.append({
            "day"  : day_names[day_idx],
            "hours": round(weekly_map.get(day_idx, 0), 2),
        })

    # ── Total study hours ────────────────────────
    total_seconds = sum(log.duration_seconds for log in logs)
    total_hours   = round(total_seconds / 3600, 1)

    return {
        "total_hours"    : total_hours,
        "total_quizzes"  : total_quizzes,
        "avg_score"      : avg_score,
        "weekly_data"    : weekly_data,
        "subject_data"   : subject_data,
        "page_time"      : page_time,
        "recent_quizzes" : recent_quizzes,
    }
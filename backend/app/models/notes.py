from fastapi import APIRouter
from app.models.analytics import Analytics
from app.database import SessionLocal


router = APIRouter()
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base
db = SessionLocal()

activity = Analytics(
    feature="Notes",
    minutes=10
)

db.add(activity)
db.commit()

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    original_text = Column(Text)
    generated_notes = Column(Text)
    key_points = Column(JSON)
    summary = Column(Text)
    status = Column(String, default="processing")  # processing, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
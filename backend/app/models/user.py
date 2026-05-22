from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class SavedTimetable(Base):
    __tablename__ = "saved_timetables"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    timetable_data = Column(JSON)
    saved_at = Column(DateTime, default=datetime.utcnow)
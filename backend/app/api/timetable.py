from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.ai.groq_service import generate_notes
from app.database import get_db
from app.models.user import SavedTimetable

import json
import re

router = APIRouter()

class TimetableRequest(BaseModel):
    subjects: list[str]
    hours_per_day: int
    goal: str
    syllabus: str
    routine: str
    preferences: list[str]

def extract_json(text):
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        return match.group(0)
    return "[]"

def extract_days_from_goal(goal: str) -> int:
    match = re.search(r"(\d+)\s*day", goal, re.IGNORECASE)
    if match:
        days = int(match.group(1))
        return min(days, 30)
    return 7

def get_day_name(day_index: int) -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[day_index % 7]

def fallback_timetable(total_days: int = 7, hours: int = 4):
    subjects_cycle = ["Math", "Physics", "Revision", "English", "Computer"]
    topics_cycle   = [
        "Chapter 1 - Introduction",
        "Chapter 2 - Core Concepts",
        "Review previous topics",
        "Chapter 3 - Advanced",
        "Practice Problems",
    ]
    result = []
    for i in range(total_days):
        day_label = f"Day {i+1} ({get_day_name(i)})"
        result.append({
            "day"     : day_label,
            "subject" : subjects_cycle[i % len(subjects_cycle)],
            "topic"   : topics_cycle[i % len(topics_cycle)],
            "time"    : "4:00 PM - 6:00 PM",
            "priority": "High",
        })
        if hours > 2:
            end_hour = 6 + (hours - 2)
            result.append({
                "day"     : day_label,
                "subject" : subjects_cycle[(i + 1) % len(subjects_cycle)],
                "topic"   : topics_cycle[(i + 1) % len(topics_cycle)],
                "time"    : f"7:00 PM - {6 + (hours - 2)}:00 PM" if end_hour <= 12 else f"7:00 PM - {end_hour - 12}:00 AM",
                "priority": "Medium",
            })
    return result

@router.post("/")
async def generate_timetable(data: TimetableRequest):

    total_days = extract_days_from_goal(data.goal)
    day_list   = ", ".join([f"Day {i+1} ({get_day_name(i)})" for i in range(total_days)])

    prompt = f"""You are StudentGPT, an expert AI academic planner.

Create a detailed study timetable for EXACTLY {total_days} days.

STUDENT INFO:
- Subjects: {", ".join(data.subjects)}
- Study Hours Per Day: {data.hours_per_day} hours — THIS IS MANDATORY EVERY DAY
- Goal: {data.goal}
- Daily Routine: {data.routine}
- Preferences: {", ".join(data.preferences)}

SYLLABUS TO COVER:
{data.syllabus}

DAYS TO PLAN (use EXACTLY these labels):
{day_list}

══════════════════════════════════════════
STEP 1 — CALCULATE FREE TIME FIRST:
Read the routine and find ALL free time slots.
Example: if routine says "university 7am-4pm, rest 7pm-8pm, sleep 1am"
→ Free slots = 4:00 PM - 7:00 PM (3 hrs) + 8:00 PM - 1:00 AM (5 hrs) = 8 free hours
Only schedule study inside these free slots.
══════════════════════════════════════════

STEP 2 — FILL EXACTLY {data.hours_per_day} HOURS OF STUDY EVERY DAY:
- Split into 2-4 sessions per day
- Each session = 1 to 2 hours long
- Add 15-30 min break between sessions
- Total across all sessions = EXACTLY {data.hours_per_day} hours per day
- Example for {data.hours_per_day} hours:
  Session 1: 4:00 PM - 6:00 PM (2 hrs)
  Session 2: 6:30 PM - 8:30 PM (2 hrs)
  = {data.hours_per_day} hours total ✓

══════════════════════════════════════════
STEP 3 — ASSIGN SYLLABUS TOPICS:
- Assign a SPECIFIC topic from the syllabus to every session
- Cover ALL topics progressively across {total_days} days
- Do NOT repeat the same topic on the same day
- Balance subjects each day (mix difficult + easy)
- Add revision session every 4-5 days
══════════════════════════════════════════

STRICT RULES:
1. ALL {total_days} days must be covered — never skip a day
2. EVERY day must have EXACTLY {data.hours_per_day} hours — NO EXCEPTIONS
3. Use exact times like "4:00 PM - 6:00 PM"
4. Priority must be exactly: High / Medium / Low
5. "day" field must use EXACT labels from DAYS TO PLAN

RETURN ONLY a valid JSON array. No markdown. No explanation. No extra text.

FORMAT:
[
  {{
    "day": "Day 1 (Monday)",
    "subject": "Physics",
    "topic": "Chapter 3 - Newton's Laws",
    "time": "4:00 PM - 6:00 PM",
    "priority": "High"
  }},
  {{
    "day": "Day 1 (Monday)",
    "subject": "OOP",
    "topic": "Week 1 - Classes and Objects",
    "time": "6:30 PM - 8:30 PM",
    "priority": "High"
  }},
  {{
    "day": "Day 2 (Tuesday)",
    "subject": "Discrete",
    "topic": "Exercise 1.1 - Logic Gates",
    "time": "4:00 PM - 5:30 PM",
    "priority": "High"
  }},
  {{
    "day": "Day 2 (Tuesday)",
    "subject": "English",
    "topic": "Week 1 - Reading Comprehension",
    "time": "6:00 PM - 7:30 PM",
    "priority": "Medium"
  }},
  {{
    "day": "Day 2 (Tuesday)",
    "subject": "Physics",
    "topic": "Chapter 5 - Work and Energy",
    "time": "8:00 PM - 9:00 PM",
    "priority": "Medium"
  }}
]

FINAL CHECK BEFORE RETURNING:
- Count hours for each day — must equal {data.hours_per_day} hours
- Every day from Day 1 to Day {total_days} must appear
- Return ONLY the JSON array"""

    try:
        raw_response = generate_notes(prompt)
        print("\nRAW RESPONSE:\n", raw_response[:500])

        raw_response = raw_response.replace("```json", "").replace("```", "").strip()
        clean_json   = extract_json(raw_response)

        print("\nCLEAN JSON:\n", clean_json[:300])

        timetable = json.loads(clean_json)

        if not timetable:
            timetable = fallback_timetable(total_days, data.hours_per_day)

        return {"timetable": timetable, "total_days": total_days}

    except Exception as e:
        print("TIMETABLE ERROR:", e)
        return {"timetable": fallback_timetable(total_days, data.hours_per_day), "total_days": total_days}


class SaveTimetableRequest(BaseModel):
    timetable: list

@router.post("/save")
def save_timetable(data: SaveTimetableRequest, request: Request, db: Session = Depends(get_db)):
    try:
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "")
        from jose import jwt
        payload = jwt.decode(token, "studentgptsecret", algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    existing = db.query(SavedTimetable).filter_by(user_id=user_id).first()
    if existing:
        existing.timetable_data = data.timetable
    else:
        db.add(SavedTimetable(user_id=user_id, timetable_data=data.timetable))
    db.commit()
    return {"message": "Saved"}


@router.get("/saved")
def get_saved(request: Request, db: Session = Depends(get_db)):
    try:
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "")
        from jose import jwt
        payload = jwt.decode(token, "studentgptsecret", algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            return {"timetable": None}
    except Exception:
        return {"timetable": None}

    saved = db.query(SavedTimetable).filter_by(user_id=user_id).first()
    return {"timetable": saved.timetable_data if saved else None}
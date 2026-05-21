from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime
from jose import jwt
from pydantic import BaseModel
import bcrypt
import logging
import random
import string
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from app.database import get_db, Base
from app.models.user import User

router = APIRouter()
SECRET_KEY = "studentgptsecret"
ALGORITHM = "HS256"
logger = logging.getLogger(__name__)

# ─── OTP Table ───────────────────────────────────────────────────────────────

class OTPRecord(Base):
    __tablename__ = "otp_records"
    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String, index=True)
    name     = Column(String)
    password = Column(String)   # hashed, stored temporarily
    otp      = Column(String)
    expires_at = Column(DateTime)

# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    name: str
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ─── Helpers ─────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.strip()[:50].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.strip()[:50].encode('utf-8'),
            hashed.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Password verify error: {e}")
        return False

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(to_email: str, name: str, otp: str):
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASS = os.getenv("EMAIL_PASS")

    if not EMAIL_USER or not EMAIL_PASS:
        logger.error("EMAIL_USER or EMAIL_PASS not set in environment")
        raise HTTPException(status_code=500, detail="Email service not configured")

    subject = "StudentGPT — Your Verification Code"
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
      <h2 style="color:#38bdf8;margin-bottom:4px;">StudentGPT</h2>
      <p style="color:#94a3b8;margin-top:0;">AI Powered Academic OS</p>
      <hr style="border-color:#1e293b;"/>
      <p>Hi <strong>{name}</strong>,</p>
      <p>Use the code below to verify your email. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0;">
        <span style="font-size:40px;font-weight:bold;letter-spacing:12px;
                     color:#a78bfa;background:#1e293b;padding:16px 28px;
                     border-radius:10px;">{otp}</span>
      </div>
      <p style="color:#64748b;font-size:13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = EMAIL_USER
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
        logger.info(f"OTP sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Check email config.")

# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/send-otp")
def send_otp(data: SendOTPRequest, db: Session = Depends(get_db)):
    """Step 1 — validate input, store pending OTP, send email."""
    email = data.email.strip().lower()

    # Check if already registered
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Delete any old OTP records for this email
    db.query(OTPRecord).filter(OTPRecord.email == email).delete()

    otp = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=10)

    record = OTPRecord(
        email      = email,
        name       = data.name.strip(),
        password   = hash_password(data.password),
        otp        = otp,
        expires_at = expires
    )
    db.add(record)
    db.commit()

    send_otp_email(email, data.name.strip(), otp)
    return {"message": "OTP sent to your email"}


@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Step 2 — verify OTP and create the real user account."""
    email = data.email.strip().lower()

    record = db.query(OTPRecord).filter(OTPRecord.email == email).first()

    if not record:
        raise HTTPException(status_code=400, detail="No OTP found. Please register again.")

    if datetime.utcnow() > record.expires_at:
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired. Please register again.")

    if record.otp != data.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    # OTP valid — create the real user
    new_user = User(
        name     = record.name,
        email    = record.email,
        password = record.password   # already hashed
    )
    db.add(new_user)
    db.delete(record)   # cleanup OTP record
    db.commit()
    db.refresh(new_user)

    return {"message": "Email verified! Account created. You can now log in."}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.email == data.email.strip().lower()
        ).first()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token({"user_id": user.id, "email": user.email})
        return {
            "token": token,
            "user": {"id": user.id, "name": user.name, "email": user.email}
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
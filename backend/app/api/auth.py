from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from pydantic import BaseModel
import logging

from app.database import get_db
from app.models.user import User

router = APIRouter()

SECRET_KEY = "studentgptsecret"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

logger = logging.getLogger(__name__)

# ── MODELS ──────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── TOKEN ───────────────────────────────

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# ── REGISTER ────────────────────────────

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(
            User.email == data.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        # ✅ force string, trim whitespace
        password = str(data.password).strip()

        if len(password) < 4:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 4 characters"
            )

        hashed_password = pwd_context.hash(password)

        new_user = User(
            name=str(data.name).strip(),
            email=str(data.email).strip().lower(),
            password=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"New user registered: {new_user.email}")

        return {"message": "User registered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

# ── LOGIN ───────────────────────────────

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        email = str(data.email).strip().lower()
        password = str(data.password).strip()

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        valid = pwd_context.verify(password, user.password)

        if not valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        token = create_token({
            "user_id": user.id,
            "email": user.email
        })

        logger.info(f"User logged in: {user.email}")

        return {
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )
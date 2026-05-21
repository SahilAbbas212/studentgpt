from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import BaseModel
import bcrypt
import logging

from app.database import get_db
from app.models.user import User

router = APIRouter()
SECRET_KEY = "studentgptsecret"
ALGORITHM = "HS256"
logger = logging.getLogger(__name__)

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.strip()[:50].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        password.strip()[:50].encode('utf-8'),
        hashed.encode('utf-8')
    )

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing = db.query(User).filter(
            User.email == data.email.strip().lower()
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        new_user = User(
            name=data.name.strip(),
            email=data.email.strip().lower(),
            password=hash_password(data.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User registered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.email == data.email.strip().lower()
        ).first()

        if not user or not verify_password(data.password, user.password):
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
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/pending-verifications")
def get_pending(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.verification_status == "pending").all()
    return users


@router.put("/approve/{user_id}")
def approve(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    user.verification_status = "approved"
    user.verified_at = datetime.utcnow()
    db.commit()

    return {"message": "User verified successfully"}


@router.put("/reject/{user_id}")
def reject(user_id: int, reason: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = "rejected"
    user.rejection_reason = reason
    user.is_verified = False
    db.commit()

    return {"message": "Verification rejected"}
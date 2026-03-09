from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from chat import models, schemas

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/send")
def send_message(data: schemas.MessageCreate, db: Session = Depends(get_db)):
    msg = models.Message(**data.dict())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"status": "Message sent successfully"}


@router.get("/history/{user1}/{user2}")
def get_history(user1: int, user2: int, db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == user1) & (models.Message.receiver_id == user2)) |
        ((models.Message.sender_id == user2) & (models.Message.receiver_id == user1))
    ).order_by(models.Message.timestamp).all()

    return messages
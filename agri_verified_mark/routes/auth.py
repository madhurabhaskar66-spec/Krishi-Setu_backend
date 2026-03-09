from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/create-user")
def create_user(name: str, email: str, role: str, db: Session = Depends(get_db)):
    
    user = User(name=name, email=email, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created", "user_id": user.id}
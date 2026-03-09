from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
import shutil
import os
from datetime import datetime

router = APIRouter(prefix="/verification", tags=["Verification"])

# Ensure folders exist
os.makedirs("uploads/farmer_docs", exist_ok=True)
os.makedirs("uploads/vendor_docs", exist_ok=True)


@router.post("/apply/{user_id}")
def apply_verification(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.verification_status == "pending":
        raise HTTPException(status_code=400, detail="Already applied")

    # Choose folder based on role
    if user.role == "farmer":
        folder = "uploads/farmer_docs"
    elif user.role == "vendor":
        folder = "uploads/vendor_docs"
    else:
        raise HTTPException(status_code=400, detail="Admins cannot apply")

    file_location = f"{folder}/{user_id}_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    user.verification_document = file_location
    user.verification_status = "pending"
    db.commit()

    return {"message": "Verification request submitted"}
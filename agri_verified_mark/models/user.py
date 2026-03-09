from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)  # farmer / vendor / admin

    # Verification fields
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="not_applied")
    verification_document = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String, nullable=True)
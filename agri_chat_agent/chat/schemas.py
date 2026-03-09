from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    sender_id: int
    sender_role: str
    receiver_id: int
    receiver_role: str
    message: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    sender_role: str
    receiver_id: int
    receiver_role: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True
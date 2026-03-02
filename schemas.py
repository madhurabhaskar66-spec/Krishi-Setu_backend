from pydantic import BaseModel, EmailStr
from typing import List

class EmailRequest(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str
    device_token: str | None = None


class OrderItemSchema(BaseModel):
    product_id: int
    quantity: float


class OrderCreate(BaseModel):
    vendor_id: int
    farmer_id: int
    items: List[OrderItemSchema]


class OrderItemSchema(BaseModel):
    product_id: int
    quantity: float


class OrderCreate(BaseModel):
    vendor_id: int
    farmer_id: int
    items: List[OrderItemSchema]
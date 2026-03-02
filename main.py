from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import random

import models
import schemas
from database import SessionLocal, engine
from pydantic import BaseModel, EmailStr

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# ------------------ DATABASE ------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------ OTP STORAGE (Temporary) ------------------

otp_storage = {}


class EmailRequest(BaseModel):
    email: EmailStr


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


# ------------------ SEND OTP ------------------

@app.post("/send-otp")
def send_otp(data: EmailRequest):
    otp = str(random.randint(100000, 999999))
    otp_storage[data.email] = otp

    return {
        "message": "OTP sent successfully",
        "otp_for_testing": otp  # remove in production
    }


# ------------------ VERIFY OTP ------------------

@app.post("/verify-otp")
def verify_otp(data: VerifyOTP):
    stored_otp = otp_storage.get(data.email)

    if not stored_otp:
        raise HTTPException(status_code=400, detail="OTP not found")

    if stored_otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    return {"message": "OTP verified successfully"}

@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


# ------------------ PLACE ORDER ------------------

@app.post("/place-order")
def place_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):

    total_amount = Decimal("0")

    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id,
            models.Product.farmer_id == order.farmer_id
        ).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product.available_quantity < item.quantity:
            raise HTTPException(status_code=400, detail="Not enough quantity available")

        item_total = Decimal(product.price_per_kg) * Decimal(item.quantity)
        total_amount += item_total

    new_order = models.Order(
        vendor_id=order.vendor_id,
        farmer_id=order.farmer_id,
        total_amount=total_amount,
        status="pending"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()

        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price_per_kg
        )

        # Reduce stock
        product.available_quantity -= Decimal(item.quantity)

        db.add(order_item)

    db.commit()

    return {
        "message": "Order placed successfully",
        "order_id": new_order.id,
        "total_amount": total_amount,
        "status": "pending"
    }


# ------------------ ACCEPT ORDER ------------------

@app.put("/order/{order_id}/accept")
def accept_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "accepted"
    db.commit()

    return {"message": "Order accepted", "status": "accepted"}


# ------------------ REJECT ORDER ------------------

@app.put("/order/{order_id}/reject")
def reject_order(order_id: int, db: Session = Depends(get_db)):

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order already processed")

    # Restore stock
    order_items = db.query(models.OrderItem).filter(
        models.OrderItem.order_id == order_id
    ).all()

    for item in order_items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()

        product.available_quantity += item.quantity

    order.status = "rejected"
    db.commit()

    return {"message": "Order rejected and stock restored", "status": "rejected"}


# ------------------ GET FARMER ORDERS ------------------

@app.get("/farmer/{farmer_id}/orders")
def get_farmer_orders(farmer_id: int, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(
        models.Order.farmer_id == farmer_id
    ).all()

    return orders
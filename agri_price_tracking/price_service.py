import random
from database import SessionLocal
from models import Product
from datetime import datetime
from alert_service import send_alert

def update_prices():
    db = SessionLocal()
    products = db.query(Product).all()

    for product in products:
        old_price = product.current_price

        # 🔹 Simulated AI-based fluctuation
        # Smaller controlled fluctuation
        change = random.uniform(-3, 6)
        new_price = round(max(1, old_price + change), 2)  # price never below 1

        # 🔹 Safe percentage calculation
        if old_price != 0:
            percentage = round(((new_price - old_price) / old_price) * 100, 2)
        else:
            percentage = 0

        # 🔹 Calculate price difference
        difference = round(new_price - old_price, 2)

        # 🔹 Update database fields
        product.previous_price = old_price
        product.current_price = new_price
        product.percentage_change = percentage
        product.price_difference = difference
        product.last_updated = datetime.utcnow()

        # 🔹 Trigger alert if significant change
        if abs(percentage) >= 5:
            send_alert(product.name, percentage, new_price)

    db.commit()
    db.close()
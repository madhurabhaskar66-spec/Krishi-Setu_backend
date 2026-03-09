from database import SessionLocal
from models import Product

def seed_products():
    db = SessionLocal()

    # Check if already exists
    if db.query(Product).first():
        print("Products already exist!")
        return

    items = [
        Product(name="Tomato", category="vegetable", current_price=30, previous_price=30, percentage_change=0),
        Product(name="Potato", category="vegetable", current_price=20, previous_price=20, percentage_change=0),
        Product(name="Onion", category="vegetable", current_price=25, previous_price=25, percentage_change=0),
        Product(name="Mango", category="fruit", current_price=80, previous_price=80, percentage_change=0),
        Product(name="Banana", category="fruit", current_price=40, previous_price=40, percentage_change=0),
        Product(name="Rose", category="flower", current_price=10, previous_price=10, percentage_change=0),
        Product(name="Jasmine", category="flower", current_price=15, previous_price=15, percentage_change=0),
    ]

    db.add_all(items)
    db.commit()
    db.close()

    print("Products inserted successfully!")

if __name__ == "__main__":
    seed_products()
from database import SessionLocal
from models import Product
from datetime import datetime
import random

db = SessionLocal()

# 🔥 CLEAR OLD DATA (prevents duplicates)
db.query(Product).delete()
db.commit()

vegetables = [
    "Tomato", "Potato", "Onion", "Carrot", "Cabbage", "Cauliflower",
    "Brinjal", "Capsicum", "Spinach", "Beans", "Peas", "Garlic",
    "Ginger", "Radish", "Beetroot", "Pumpkin", "Bitter Gourd",
    "Bottle Gourd", "Ridge Gourd", "Drumstick", "Sweet Corn",
    "Broccoli", "Mushroom", "Turnip", "Okra (Lady Finger)",
    "Cucumber", "Zucchini", "Spring Onion", "Lettuce",
    "Fenugreek Leaves", "Coriander Leaves", "Mint Leaves"
]

fruits = [
    "Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple",
    "Papaya", "Guava", "Watermelon", "Pomegranate", "Kiwi",
    "Strawberry", "Blueberry", "Blackberry", "Cherry",
    "Litchi", "Dragon Fruit", "Custard Apple", "Pear",
    "Plum", "Apricot", "Fig", "Jackfruit", "Sapota (Chikoo)",
    "Coconut", "Mosambi", "Avocado"
]

flowers = [
    "Rose", "Jasmine", "Lily", "Marigold", "Lotus",
    "Tulip", "Sunflower", "Orchid", "Hibiscus",
    "Daisy", "Chrysanthemum", "Carnation",
    "Gerbera", "Bougainvillea", "Tuberose",
    "Lavender", "Peony", "Begonia",
    "Dahlia", "Magnolia"
]

def add_products(names, category):
    for name in names:
        current_price = random.randint(20, 300)
        previous_price = current_price - random.randint(-30, 30)

        percentage_change = round(
            ((current_price - previous_price) / previous_price) * 100, 2
        ) if previous_price != 0 else 0

        price_difference = current_price - previous_price

        product = Product(
            name=name,
            category=category,
            current_price=current_price,
            previous_price=previous_price,
            percentage_change=percentage_change,
            price_difference=price_difference,
            last_updated=datetime.utcnow()
        )

        db.add(product)

add_products(vegetables, "vegetable")
add_products(fruits, "fruit")
add_products(flowers, "flower")

db.commit()
db.close()

print("🔥 All vegetables, fruits, and flowers added successfully!")
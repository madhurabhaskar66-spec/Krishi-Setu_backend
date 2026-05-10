from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import SessionLocal
from models import Product

def get_category(name):
    name = name.lower()

    vegetables = [
        "tomato", "potato", "onion", "brinjal", "cabbage", "cauliflower",
        "carrot", "radish", "spinach", "capsicum", "chilli", "beans",
        "gourd", "pumpkin", "cucumber", "drumstick", "okra", "beetroot"
    ]

    fruits = [
        "mango", "banana", "apple", "orange", "grapes", "pomegranate",
        "papaya", "guava", "watermelon", "melon", "pineapple",
        "sapota", "jackfruit", "sweet lime"
    ]

    flowers = [
        "rose", "jasmine", "marigold", "chrysanthemum",
        "lily", "lotus", "gerbera", "sunflower", "tuberose"
    ]

    field_crops = [
        "rice", "paddy", "wheat", "maize", "corn", "ragi",
        "jowar", "bajra", "sugarcane",
        "gram", "chana", "moong", "urad", "masoor", "toor",
        "groundnut", "mustard", "sesame",
        "turmeric", "ginger", "coriander", "cumin"
    ]

    for word in vegetables:
        if word in name:
            return "vegetable"

    for word in fruits:
        if word in name:
            return "fruit"

    for word in flowers:
        if word in name:
            return "flower"

    for word in field_crops:
        if word in name:
            return "field_crop"

    return "other"

app = FastAPI()

# Serve static files (css + js)
app.mount("/static", StaticFiles(directory="static"), name="static")


# Serve HTML page
@app.get("/")
def home():
    return FileResponse("templates/index.html")


# API that frontend calls
@app.get("/prices")
def get_prices():
    db = SessionLocal()
    products = db.query(Product).all()

    result = []

    for p in products:
        price_per_kg = (p.modal_price or 0) / 100
        diff_per_kg = (p.price_difference or 0) / 100

        result.append({
            "name": p.commodity,
            "category": get_category(p.commodity),
            "current_price": round(price_per_kg, 2),
            "price_difference": round(diff_per_kg, 2),
            "percentage_change": round(p.percentage_change or 0, 2),
            "last_updated": p.last_updated.isoformat() if p.last_updated else None
        })

    db.close()
    return result

@app.get("/summary")
def get_summary():
    db = SessionLocal()
    products = db.query(Product).all()

    increases = []
    decreases = []

    for p in products:
        if p.percentage_change:
            if p.percentage_change > 0:
                increases.append(p.percentage_change)
            elif p.percentage_change < 0:
                decreases.append(p.percentage_change)

    avg_increase = sum(increases)/len(increases) if increases else 0
    avg_decrease = sum(decreases)/len(decreases) if decreases else 0

    db.close()

    return {
        "average_increase": round(avg_increase, 2),
        "average_decrease": round(avg_decrease, 2)
    }

@app.on_event("startup")
def load_data_on_startup():
    from real_price_fetcher import update_prices_from_api
    update_prices_from_api()
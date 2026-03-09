from database import SessionLocal
from models import Product

db = SessionLocal()

products = db.query(Product).all()

if not products:
    print("⚠ No data found in database.")
else:
    for p in products:
        print("Commodity:", p.commodity)
        print("Modal Price:", p.modal_price)
        print("Previous Price:", p.previous_price)
        print("Difference:", p.price_difference)
        print("Percentage Change:", p.percentage_change)
        print("Last Updated:", p.last_updated)
        print("-" * 40)

db.close()
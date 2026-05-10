import pandas as pd
import requests
from database import SessionLocal
from models import Product
from datetime import datetime

# Public Data.gov.in Mandi Prices API (Latest records)
API_URL = "https://api.data.gov.in/resource/9ef273e5-7f5d-4551-a0a8-d367b1766914?api-key=579b464db66ec23bdd000001cdd3946e448c48ef59837a59e793c479&format=json&offset=0&limit=100"

def update_prices_from_api():
    print("📡 Fetching live mandi prices from Data.gov.in...")
    try:
        response = requests.get(API_URL, timeout=10)
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            if records:
                process_records(records)
                print(f"✅ Successfully updated {len(records)} prices from API.")
                return True
    except Exception as e:
        print(f"⚠️ API Fetch failed: {e}. Falling back to CSV.")
    
    # Fallback to CSV if API fails
    return update_prices_from_csv()

def process_records(records):
    db = SessionLocal()
    try:
        for row in records:
            commodity_name = row.get("commodity", row.get("Commodity"))
            if not commodity_name: continue

            product = db.query(Product).filter(Product.commodity.ilike(f"%{commodity_name}%")).first()
            
            # Extract prices safely
            try:
                new_price = float(row.get("modal_price", row.get("Modal_x0020_Price", 0)))
                min_p = float(row.get("min_price", row.get("Min_x0020_Price", 0)))
                max_p = float(row.get("max_price", row.get("Max_x0020_Price", 0)))
            except: continue

            if product:
                old_price = product.modal_price or 0
                product.previous_price = old_price
                product.modal_price = new_price
                product.price_difference = new_price - old_price
                product.percentage_change = ((new_price - old_price) / old_price * 100) if old_price != 0 else 0
                product.last_updated = datetime.utcnow()
            else:
                new_product = Product(
                    commodity=commodity_name,
                    state=row.get("state", row.get("State")),
                    district=row.get("district", row.get("District")),
                    market=row.get("market", row.get("Market")),
                    min_price=min_p,
                    max_price=max_p,
                    modal_price=new_price,
                    previous_price=0,
                    price_difference=0,
                    percentage_change=0,
                    arrival_date=str(row.get("arrival_date", row.get("Arrival_Date"))),
                    last_updated=datetime.utcnow()
                )
                db.add(new_product)
        db.commit()
    finally:
        db.close()

def update_prices_from_csv():
    print("📂 Updating from local CSV cache...")
    db = SessionLocal()
    try:
        df = pd.read_csv("agmarknet_data.csv")
        records = df.to_dict('records')
        process_records(records)
        print("✅ Prices updated from CSV successfully!")
        return True
    except Exception as e:
        print("❌ Error updating from CSV:", e)
        return False
    finally:
        db.close()
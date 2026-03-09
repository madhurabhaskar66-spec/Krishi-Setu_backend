import requests
import pandas as pd
from database import SessionLocal
from models import Product
from datetime import datetime, timezone
import os

CSV_URL = "PASTE_YOUR_DATA_GOV_CSV_DIRECT_LINK_HERE"
CSV_FILE = "agmarknet_data.csv"


def download_csv():
    print("Downloading latest mandi data...")

    response = requests.get(CSV_URL)

    if response.status_code == 200:
        with open(CSV_FILE, "wb") as f:
            f.write(response.content)
        print("CSV downloaded successfully.")
    else:
        print("Failed to download CSV.")


def import_csv_to_db():
    print("Importing CSV to database...")

    df = pd.read_csv(CSV_FILE)

    db = SessionLocal()

    # Clear old data
    db.query(Product).delete()
    db.commit()

    for _, row in df.iterrows():
        product = Product(
            commodity=row["Commodity"],
            state=row["State"],
            district=row["District"],
            market=row["Market"],
            min_price=float(row["Min_x0020_Price"]),
            max_price=float(row["Max_x0020_Price"]),
            modal_price=float(row["Modal_x0020_Price"]),
            arrival_date=row["Arrival_Date"],
            last_updated=datetime.now(timezone.utc)
        )
        db.add(product)

    db.commit()
    db.close()

    print("Database updated successfully.")


def auto_update():
    download_csv()
    import_csv_to_db()
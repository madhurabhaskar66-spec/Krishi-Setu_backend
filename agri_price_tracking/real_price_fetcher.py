import pandas as pd
from database import SessionLocal
from models import Product
from datetime import datetime


def update_prices_from_csv():
    db = SessionLocal()

    try:
        # Read CSV
        df = pd.read_csv("agmarknet_data.csv")

        for _, row in df.iterrows():

            commodity_name = row["Commodity"]

            # Check if product already exists
            product = db.query(Product).filter(
                Product.commodity.ilike(f"%{commodity_name}%")
            ).first()

            new_price = float(row["Modal_x0020_Price"])

            if product:
                # -------- UPDATE EXISTING PRODUCT --------
                old_price = product.modal_price or 0

                product.previous_price = old_price
                product.modal_price = new_price
                product.price_difference = new_price - old_price

                if old_price != 0:
                    product.percentage_change = (
                        (new_price - old_price) / old_price
                    ) * 100
                else:
                    product.percentage_change = 0

                product.min_price = float(row["Min_x0020_Price"])
                product.max_price = float(row["Max_x0020_Price"])
                product.state = row["State"]
                product.district = row["District"]
                product.market = row["Market"]
                product.arrival_date = str(row["Arrival_Date"])
                product.last_updated = datetime.utcnow()

            else:
                # -------- INSERT NEW PRODUCT --------
                new_product = Product(
                    commodity=row["Commodity"],
                    state=row["State"],
                    district=row["District"],
                    market=row["Market"],
                    min_price=float(row["Min_x0020_Price"]),
                    max_price=float(row["Max_x0020_Price"]),
                    modal_price=new_price,
                    previous_price=0,
                    price_difference=0,
                    percentage_change=0,
                    arrival_date=str(row["Arrival_Date"]),
                    last_updated=datetime.utcnow(),
                )

                db.add(new_product)

        db.commit()
        print("✅ Prices inserted/updated successfully!")

    except Exception as e:
        print("❌ Error updating from CSV:", e)

    finally:
        db.close()
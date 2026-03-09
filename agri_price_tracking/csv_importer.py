import pandas as pd
from database import SessionLocal
from models import Product
from datetime import datetime, timezone

db = SessionLocal()

df = pd.read_csv("agmarknet_data.csv")

print("Columns in CSV:")
print(df.columns)

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

print("✅ Real mandi data imported successfully!")
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    commodity = Column(String)
    state = Column(String)
    district = Column(String)
    market = Column(String)

    min_price = Column(Float)
    max_price = Column(Float)
    modal_price = Column(Float)

    previous_price = Column(Float)
    price_difference = Column(Float)
    percentage_change = Column(Float)

    arrival_date = Column(String)
    last_updated = Column(DateTime)

    
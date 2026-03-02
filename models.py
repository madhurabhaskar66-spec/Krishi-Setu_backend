from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    role = Column(String)  # farmer / vendor


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    price_per_kg = Column(DECIMAL)
    available_quantity = Column(DECIMAL)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    vendor_id = Column(Integer)
    farmer_id = Column(Integer)
    total_amount = Column(DECIMAL)
    status = Column(String, default="pending")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer)
    quantity = Column(DECIMAL)
    price = Column(DECIMAL)
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    role = Column(String)  # farmer / vendor
    field_location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


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


class HarvestPost(Base):
    __tablename__ = "harvest_posts"

    id = Column(Integer, primary_key=True)
    description = Column(String)
    image_url = Column(String)
    video_url = Column(String)
    likes_count = Column(Integer, default=0)
    author_email = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class Comment(Base):
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("harvest_posts.id"))
    user_name = Column(String, default="Farmer")
    text = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
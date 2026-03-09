from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database
from database import engine, Base

# Import chat model so table gets created
from chat.models import Message

# Import router
from chat.routes import router as chat_router

# Create FastAPI App
app = FastAPI(
    title="AgriLink Farmer-Vendor Chat System",
    description="Direct communication module between Farmers and Vendors",
    version="1.0.0"
)

# Enable CORS (for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Include Chat Router
app.include_router(chat_router)

# Root Route
@app.get("/")
def root():
    return {
        "message": "Farmer-Vendor Chat Service is Running 🚀"
    }
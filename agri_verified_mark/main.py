from fastapi import FastAPI
from database import engine
from models.user import Base
from routes import auth, verification, admin

app = FastAPI(title="Agri Verification System")

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(verification.router)
app.include_router(admin.router)
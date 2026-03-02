import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
EMAIL_ADDRESS = os.getenv("SENDER_EMAIL")
EMAIL_PASSWORD = os.getenv("APP_PASSWORD")
SECRET_KEY = os.getenv("SECRET_KEY")
FCM_SERVER_KEY = os.getenv("FCM_SERVER_KEY")
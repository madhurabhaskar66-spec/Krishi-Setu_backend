import random
import smtplib
from email.mime.text import MIMEText
from config import EMAIL_ADDRESS, EMAIL_PASSWORD


def generate_otp():
    return str(random.randint(100000, 999999))


def send_email_otp(receiver_email: str, otp: str):
    subject = "Your OTP Code"
    body = f"Your OTP is: {otp}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, receiver_email, msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise Exception("Email authentication failed. Check SENDER_EMAIL and APP_PASSWORD in .env")
    except smtplib.SMTPException as e:
        raise Exception(f"Failed to send email: {str(e)}")
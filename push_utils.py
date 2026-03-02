import firebase_admin
from firebase_admin import credentials, messaging

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)

def send_push_notification(token: str, title: str, body: str):

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )

    response = messaging.send(message)
    return response
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.core.email_handler import send_contact_confirmation, send_contact_notification

print("Sending notification...")
notif_res = send_contact_notification("Test User", "test@example.com", "123456", "Test message")
print(f"Notification result: {notif_res}")

print("Sending confirmation...")
conf_res = send_contact_confirmation("Test User", "test@example.com")
print(f"Confirmation result: {conf_res}")

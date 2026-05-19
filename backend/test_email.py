import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText

load_dotenv()

smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT", "587"))
smtp_username = os.getenv("SMTP_USERNAME")
smtp_password = os.getenv("SMTP_PASSWORD")

print(f"Username: '{smtp_username}'")
print(f"Password: '{smtp_password}'")

try:
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_username.strip(), smtp_password.strip())
    print("Login successful with stripped credentials!")
    server.quit()
except Exception as e:
    print(f"Error stripped: {e}")

try:
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_username, smtp_password)
    print("Login successful with raw credentials!")
    server.quit()
except Exception as e:
    print(f"Error raw: {e}")

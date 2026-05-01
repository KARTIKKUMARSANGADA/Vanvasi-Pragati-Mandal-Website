import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading

def send_contact_email(name: str, email: str, phone: str, message: str):
    """
    Sends an email notification for a new contact form submission.
    Runs synchronously but called from background task.
    """
    SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
    RECEIVER_EMAIL = "kartiksangada2004@gmail.com"

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("SMTP credentials not configured. Skipping email notification.")
        return

    subject = f"New Contact Message from {name}"
    
    body = f"""
    You have received a new contact message:
    
    Name: {name}
    Email: {email}
    Phone: {phone}
    
    Message:
    {message}
    """
    
    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = RECEIVER_EMAIL
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("Contact email sent successfully.")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_email_background(name: str, email: str, phone: str, message: str):
    """Fire and forget thread for sending email"""
    thread = threading.Thread(target=send_contact_email, args=(name, email, phone, message))
    thread.start()

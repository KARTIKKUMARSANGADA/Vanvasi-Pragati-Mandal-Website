import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_contact_notification(name: str, email: str, phone: str, message: str):
    """
    Sends an email notification to the admin when a new contact message is received.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    admin_email = os.getenv("ADMIN_EMAIL", smtp_username) # Usually send to self

    if not smtp_username or not smtp_password:
        logger.warning("SMTP credentials not set. Email notification skipped.")
        return False

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = admin_email
        msg['Subject'] = f"New Contact Message from {name}"

        body = f"""
        You have received a new contact message from your website:
        
        Name: {name}
        Email: {email}
        Phone: {phone}
        
        Message:
        {message}
        
        ---
        This is an automated notification.
        """
        msg.attach(MIMEText(body, 'plain'))

        # Connect and send
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email notification sent to {admin_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")
        return False

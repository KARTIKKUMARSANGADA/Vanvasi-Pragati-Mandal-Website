import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

# Explicitly load .env file
load_dotenv()

logger = logging.getLogger(__name__)

def send_contact_notification(name: str, email: str, phone: str, message: str):
    """
    Sends an email notification to the admin when a new contact message is received.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587").strip())
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    admin_email = os.getenv("ADMIN_EMAIL", smtp_username).strip()

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

def send_contact_confirmation(name: str, recipient_email: str):
    """
    Sends a thank-you confirmation email to the person who submitted a contact message.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587").strip())
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_username or not smtp_password:
        logger.warning("SMTP credentials not set. Confirmation email skipped.")
        return False

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"Vanvasi Pragati Mandal <{smtp_username}>"
        msg['To'] = recipient_email
        msg['Subject'] = "Thank You for Reaching Out - Vanvasi Pragati Mandal"

        body = f"""Dear {name},

Thank you for contacting Vanvasi Pragati Mandal Pipaliya. We have received your message and appreciate you taking the time to reach out to us.

Our team is dedicated to empowering rural and tribal communities, and your interest or feedback is very valuable to us. We will review your message and get back to you as soon as possible.

If you have any urgent queries, please feel free to reach us via our WhatsApp number or reply directly to this email.

Warm regards,
Vanvasi Pragati Mandal Pipaliya
---
This is an automated confirmation of your submission.
"""
        msg.attach(MIMEText(body, 'plain'))

        # Connect and send
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Confirmation email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {recipient_email}: {e}")
        return False

def send_project_notification(subscriber_email: str, title: str, description: str, category: str, location: str):
    """
    Sends a newsletter notification to a subscriber about a newly completed NGO project.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587").strip())
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_username or not smtp_password:
        logger.warning("SMTP credentials not set. Email notification to subscriber skipped.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = subscriber_email
        msg['Subject'] = f"New NGO Project Completed: {title}"

        body = f"""
Dear Supporter,

We are proud to share a new milestone with you! Vanvasi Pragati Mandal has successfully completed a new community welfare project:

Project Name: {title}
Category: {category}
Location: {location}

Description:
{description}

Thank you for your continuous support, which makes these community transformations possible.

Warm regards,
Vanvasi Pragati Mandal Pipaliya
---
You received this email because you subscribed to our newsletter impact updates.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Project completion notification sent to subscriber: {subscriber_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send subscriber email: {e}")
        return False

def send_custom_email(recipient_email: str, subject: str, content: str):
    """
    Sends a custom email body to a subscriber or custom recipient.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587").strip())
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()

    if not smtp_username or not smtp_password:
        logger.warning("SMTP credentials not set. Custom email transmission skipped.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = recipient_email
        msg['Subject'] = subject

        body = f"""{content}

---
Vanvasi Pragati Mandal Pipaliya
This email was composed and sent by the administrator.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Custom email sent to: {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send custom email to {recipient_email}: {e}")
        return False

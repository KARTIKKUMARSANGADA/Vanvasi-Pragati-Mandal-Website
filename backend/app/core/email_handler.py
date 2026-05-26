import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import base64
import time
import random
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)

# ── Load Base64 logo once at module level and decode to binary bytes ──
_LOGO_BYTES = None
_logo_path = os.path.join(os.path.dirname(__file__), "logo_b64.txt")
try:
    with open(_logo_path, "r") as f:
        logo_b64_str = f.read().strip()
    if logo_b64_str:
        _LOGO_BYTES = base64.b64decode(logo_b64_str)
        logger.info("Successfully loaded and decoded logo binary bytes for inline email attachment.")
except Exception as e:
    logger.warning(f"Could not load/decode logo_b64.txt: {e}")

# ── Reusable HTML blocks ──

def _header_html() -> str:
    """Elegant green background header with centered logo and white typography to match the user reference design."""
    return """
    <div style="background-color: #1b4332; padding: 32px 24px; text-align: center;">
        <img src="https://vanvasi-pragati-mandal-pipaliya.vercel.app/LOGO.png" alt="Vanvasi Pragati Mandal Logo" width="56" height="56" style="display: block; margin: 0 auto 12px auto; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255, 255, 255, 0.3); background-color: #ffffff;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Vanvasi Pragati Mandal
        </h1>
        <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Pipaliya &bull; Dahod &bull; Gujarat
        </p>
    </div>
    """

def _footer_html(note: str = "This is an automated notification from the Vanvasi Pragati Mandal platform.") -> str:
    """Sleek, ultra-compact white-background footer with a thin separator line, inline contact row, social media icons, and dynamic token."""
    # Generate unique token to stop Gmail from grouping/collapsing the footer
    unique_token = f"{time.time():.0f}-{random.randint(1000, 9999)}"
    
    # Build social media row
    social_row = """
    <div style="margin-bottom: 8px; text-align: center;">
        <a href="https://facebook.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
            <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" width="16" height="16" alt="Facebook" style="display: block; border-radius: 50%;" />
        </a>
        <a href="https://twitter.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
            <img src="https://cdn-icons-png.flaticon.com/512/3256/3256013.png" width="16" height="16" alt="Twitter" style="display: block; border-radius: 50%;" />
        </a>
        <a href="https://instagram.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="16" height="16" alt="Instagram" style="display: block; border-radius: 50%;" />
        </a>
        <a href="https://linkedin.com" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="16" height="16" alt="LinkedIn" style="display: block; border-radius: 50%;" />
        </a>
        <a href="https://wa.me/918140255951" style="display: inline-block; margin: 0 4px; text-decoration: none; vertical-align: middle;">
            <img src="https://cdn-icons-png.flaticon.com/512/3536/3536445.png" width="16" height="16" alt="WhatsApp" style="display: block; border-radius: 50%;" />
        </a>
    </div>
    """
    
    return f"""
    <div style="background-color: #ffffff; padding: 16px 20px; text-align: center; border-top: 1px solid #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Contact details inline row -->
        <div style="font-size: 12px; color: #475569; margin-bottom: 8px; font-weight: 500;">
            <span style="display: inline-block; margin: 2px 6px;">📞 +91 81402 55951</span>
            <span style="color: #cbd5e1; margin: 0 8px; display: inline-block;">|</span>
            <span style="display: inline-block; margin: 2px 6px;">✉️ official.vanvasipragatimandal@gmail.com</span>
        </div>

        {social_row}

        <!-- Copyright -->
        <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 500; letter-spacing: 0.3px;">
            &copy; 2026 Vanvasi Pragati Mandal. All rights reserved. <span style="display: none !important; font-size: 0px; line-height: 0px; opacity: 0; color: transparent; max-height: 0px; max-width: 0px; overflow: hidden; mso-hide: all;">{unique_token}</span>
        </p>
    </div>
    """

def _wrap_body(inner_html: str, footer_note: str = "") -> str:
    """Wraps inner content in a clean card layout with soft shadows and border matching reference design."""
    footer = _footer_html(footer_note) if footer_note else _footer_html()
    return f"""
    <html>
    <body style="background-color: #f1f5f9; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);">
            {_header_html()}
            {inner_html}
            {footer}
        </div>
    </body>
    </html>
    """

# ── Internal SMTP helper ──

def _get_smtp_connection():
    """Opens and returns a logged-in SMTP connection."""
    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
    server.starttls()
    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
    return server

def _send_single(to: str, subject: str, html_body: str, server=None) -> bool:
    """Send a single email. If BREVO_API_KEY is configured, uses Brevo HTTP API. Otherwise falls back to SMTP."""
    if settings.BREVO_API_KEY:
        try:
            import requests
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "api-key": settings.BREVO_API_KEY,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
            
            payload = {
                "sender": {
                    "name": "Vanvasi Pragati Mandal",
                    "email": settings.BREVO_FROM_EMAIL
                },
                "to": [
                    {
                        "email": to
                    }
                ],
                "subject": subject,
                "htmlContent": html_body
            }
            
            logger.info(f"Attempting to send email to {to} via Brevo HTTP API...")
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Branded email successfully sent to {to} via Brevo API.")
                return True
            else:
                logger.error(f"Failed to send email to {to} via Brevo API: Status {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Exception during Brevo API call to {to}: {e}")
            return False

    # --- SMTP Fallback ---
    smtp_username = settings.SMTP_USERNAME
    smtp_password = settings.SMTP_PASSWORD
    if not smtp_username or not smtp_password:
        logger.warning("SMTP credentials not set. Email skipped.")
        return False

    close_after = False
    try:
        # Related content type for robust inline attachments
        msg = MIMEMultipart("related")
        msg['From'] = f"Vanvasi Pragati Mandal <{smtp_username}>"
        msg['To'] = to
        msg['Subject'] = subject

        # HTML body alternative block
        msg_alternative = MIMEMultipart("alternative")
        msg.attach(msg_alternative)
        msg_alternative.attach(MIMEText(html_body, 'html'))

        # Attach the logo binary as a MIMEImage with Content-ID <logo>
        if _LOGO_BYTES:
            try:
                mime_image = MIMEImage(_LOGO_BYTES)
                mime_image.add_header('Content-ID', '<logo>')
                mime_image.add_header('Content-Disposition', 'inline', filename="logo.png")
                msg.attach(mime_image)
            except Exception as img_err:
                logger.error(f"Failed to attach logo MIMEImage: {img_err}")

        if server is None:
            server = _get_smtp_connection()
            close_after = True

        server.send_message(msg)

        if close_after:
            server.quit()

        logger.info(f"Branded email successfully sent to {to} (SMTP)")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False

# ────────────────────────────────────────────
#  PUBLIC API
# ────────────────────────────────────────────

def send_contact_notification(name: str, email: str, phone: str, message: str):
    """
    Sends an email notification to the admin when a new contact message is received.
    """
    admin_email = settings.ADMIN_EMAIL or settings.SMTP_USERNAME
    inner = f"""
    <div style="padding: 36px 40px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.8px;">📩 New Message</div>
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: 700; letter-spacing: -0.2px;">Contact Form Submission</h2>

        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
            A new visitor message has been received through the website contact form. The details are below:
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; width: 90px; color: #1e293b; font-size: 13px; vertical-align: top;">Name</td>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px;">{name}</td>
                </tr>
                <tr>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b; font-size: 13px; vertical-align: top;">Email</td>
                    <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 14px;">
                        <a href="mailto:{email}" style="color: #16a34a; text-decoration: none; font-weight: 600;">{email}</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 14px 16px; font-weight: 700; color: #1e293b; font-size: 13px; vertical-align: top;">Phone</td>
                    <td style="padding: 14px 16px; color: #475569; font-size: 14px;">{phone}</td>
                </tr>
            </table>
        </div>

        <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Message Content</h3>
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; white-space: pre-wrap; color: #334155; line-height: 1.7; font-size: 15px;">{message}</p>
        </div>
    </div>
    """
    html = _wrap_body(inner, "Admin notification from Vanvasi Pragati Mandal platform.")
    return _send_single(admin_email, f"New Contact Message from {name}", html)


def send_contact_confirmation(name: str, recipient_email: str):
    """
    Sends a thank-you confirmation email to the person who submitted a contact message.
    """
    inner = f"""
    <div style="padding: 36px 40px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px; font-weight: 700; letter-spacing: -0.2px;">Thank You for Reaching Out! 🙏</h2>

        <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.7;">
            Dear <strong style="color: #1e293b;">{name}</strong>,
        </p>

        <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.7;">
            We have received your message and truly appreciate you taking the time to contact us.
            Our team is dedicated to empowering rural and tribal communities, and your interest or feedback is incredibly valuable to our mission.
        </p>

        <p style="margin: 0 0 28px 0; color: #475569; font-size: 15px; line-height: 1.7;">
            We will carefully review your message and get back to you as soon as possible.
        </p>

        <div style="background-color: #f4fbf7; border: 1px solid #d1fae5; padding: 24px; border-radius: 12px; margin-bottom: 8px;">
            <p style="margin: 0 0 8px 0; color: #065f46; font-size: 15px; line-height: 1.5; font-weight: 700;">
                Need urgent assistance?
            </p>
            <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                Feel free to reach us directly via WhatsApp.
            </p>
            <a href="https://wa.me/918140255951" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(21,128,61,0.2); vertical-align: middle;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/150px-WhatsApp.svg.png" width="16" height="16" alt="" style="display: inline-block; vertical-align: middle; margin-right: 8px;" />
                <span style="display: inline-block; vertical-align: middle;">Chat on WhatsApp</span>
            </a>
        </div>
    </div>
    """
    html = _wrap_body(inner, "© 2026 Vanvasi Pragati Mandal. All rights reserved.")
    return _send_single(recipient_email, "Thank You for Reaching Out - Vanvasi Pragati Mandal", html)


def send_project_notification(subscriber_email: str, title: str, description: str, category: str, location: str, server=None):
    """
    Sends a newsletter notification to a subscriber about a newly completed NGO project.
    Accepts an optional `server` for batch sending with a reused SMTP connection.
    """
    inner = f"""
    <div style="padding: 36px 40px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.8px;">🎉 Project Update</div>
        <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 20px; font-weight: 700; letter-spacing: -0.2px;">{title}</h2>

        <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.7;">Dear Supporter,</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.7;">
            We are proud to share a new milestone with you! We have successfully completed another community welfare project.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;"><strong>Category:</strong> <span style="color: #16a34a; font-weight: 600;">{category}</span></p>
            <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Location:</strong> <span style="color: #475569;">{location}</span></p>
        </div>

        <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">About this project</h3>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">{description}</p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6; font-weight: 500;">
                Thank you for your continuous support which makes these community transformations possible! 💚
            </p>
        </div>
    </div>
    """
    html = _wrap_body(inner, "You received this email because you subscribed to our impact updates.")
    return _send_single(subscriber_email, f"New Project: {title}", html, server=server)


def send_custom_email(recipient_email: str, subject: str, content: str, server=None):
    """
    Sends a custom email body to a subscriber or custom recipient.
    Accepts an optional `server` for batch sending with a reused SMTP connection.
    """
    inner = f"""
    <div style="padding: 36px 40px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.8px;">📢 Announcement</div>
        <div style="font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-wrap;">{content}</div>
    </div>
    """
    html = _wrap_body(inner, "This email was composed and sent by the Vanvasi Pragati Mandal team.")
    return _send_single(recipient_email, subject, html, server=server)


def send_bulk_custom_email(recipients: list, subject: str, content: str) -> dict:
    """
    Sends a custom email to multiple recipients using a SINGLE SMTP connection.
    Returns {"success_count": N, "total": M}.
    """
    smtp_username = settings.SMTP_USERNAME
    smtp_password = settings.SMTP_PASSWORD
    if not smtp_username or not smtp_password:
        logger.warning("SMTP credentials not set. Bulk email skipped.")
        return {"success_count": 0, "total": len(recipients)}

    success_count = 0
    try:
        server = _get_smtp_connection()
        for email in recipients:
            try:
                if send_custom_email(email, subject, content, server=server):
                    success_count += 1
            except Exception as e:
                logger.error(f"Failed to send to {email} in bulk: {e}")
        server.quit()
    except Exception as e:
        logger.error(f"SMTP connection error during bulk send: {e}")

    return {"success_count": success_count, "total": len(recipients)}


def send_bulk_project_notification(recipients: list, project_details: dict) -> dict:
    """
    Sends a project notification email to multiple recipients in a managed way.
    If BREVO_API_KEY is defined, it loops sequentially making HTTP requests.
    Otherwise, it logs in once and reuses the SMTP connection across all recipients.
    """
    smtp_username = settings.SMTP_USERNAME
    smtp_password = settings.SMTP_PASSWORD
    is_smtp = not bool(settings.BREVO_API_KEY)

    success_count = 0
    if is_smtp:
        if not smtp_username or not smtp_password:
            logger.warning("SMTP credentials not set. Bulk project notification skipped.")
            return {"success_count": 0, "total": len(recipients)}
        
        try:
            server = _get_smtp_connection()
            for email in recipients:
                try:
                    if send_project_notification(
                        subscriber_email=email,
                        title=project_details.get("title", ""),
                        description=project_details.get("description", ""),
                        category=project_details.get("category", ""),
                        location=project_details.get("location", ""),
                        server=server
                    ):
                        success_count += 1
                except Exception as e:
                    logger.error(f"Failed to send SMTP project notification to {email} in bulk: {e}")
            server.quit()
        except Exception as e:
            logger.error(f"SMTP connection error during bulk project notification: {e}")
    else:
        for email in recipients:
            try:
                if send_project_notification(
                    subscriber_email=email,
                    title=project_details.get("title", ""),
                    description=project_details.get("description", ""),
                    category=project_details.get("category", ""),
                    location=project_details.get("location", "")
                ):
                    success_count += 1
            except Exception as e:
                logger.error(f"Failed to send Brevo project notification to {email}: {e}")

    return {"success_count": success_count, "total": len(recipients)}


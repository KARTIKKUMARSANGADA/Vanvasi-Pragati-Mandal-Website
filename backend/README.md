# Vanvasi Pragati Mandal - FastAPI Backend

This is the robust, high-performance API backend powering the **Vanvasi Pragati Mandal** NGO platform. It is built using FastAPI (Python 3) and connects directly to a PostgreSQL database on Supabase.

## 🚀 Key Features

- **Supabase Integration**: Utilizing the Supabase Python SDK for instant database transactions, real-time fetching, and secure Supabase Storage integration.
- **RESTful Endpoints**: Dedicated routes for:
  - `/api/projects`: Handle projects, image attachments, automatic resizing, compression, and position sorting.
  - `/api/gallery`: Organize gallery photographs dynamically.
  - `/api/contact`: Form submissions with automated confirmation emails and honeypot spam protection.
  - `/api/stats`: Fetch real-time statistics aggregated from Supabase tables.
  - `/api/auth`: Secure admin credentials check and stateless JWT tokens authentication.
- **Email Notification System**: Automated server-side email dispatching via standard Python `smtplib` using secure TLS/SSL to deliver:
  - Admin notifications for new inquiries.
  - Personalized HTML/Plain-text thank-you confirmations to the visitors.
  - Mass subscriber updates on project completions.

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── api/             # API Router definitions & endpoints
│   ├── core/            # Configuration, security, and email handlers
│   ├── db/              # Database connections (Supabase)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Core business and query logic
│   └── main.py          # Application entry point
├── uploads/             # (Git ignored) Local temp folder for file operations
├── requirements.txt     # Python dependencies
├── run.py               # Uvicorn launcher
└── .env                 # Environment credentials configuration
```

## 🛠️ Installation and Execution

```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env and populate credentials
cp .env.example .env

# 4. Start Uvicorn developer server
python run.py
```

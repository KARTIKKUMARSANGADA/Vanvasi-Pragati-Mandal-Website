# Vanvasi Pragati Mandal (VPM) - NGO Platform

A modern, full-stack web platform built for the **Vanvasi Pragati Mandal (VPM)** NGO. It features a stunning, dynamic public-facing website and a secure, powerful Admin Dashboard for managing projects, gallery assets, contact messages, and subscribers.

## 🚀 Tech Stack

### Frontend
*   **Framework:** React + Vite
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Routing:** React Router DOM
*   **Icons:** Lucide React

### Backend
*   **Framework:** FastAPI (Python)
*   **Database:** PostgreSQL (via Supabase)
*   **Client API:** Supabase Python SDK
*   **Authentication:** JWT + bcrypt password hashing
*   **Emails:** Python smtplib with automated templates

---

## 💻 Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Vanvasi-Website
```

### 2. Backend Setup (FastAPI)
Open a terminal and navigate to the `backend` folder:
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file based on .env.example
cp .env.example .env
# Populate the required environment variables in the newly created .env:
# - SECRET_KEY
# - SUPABASE_URL & SUPABASE_KEY (for DB connection)
# - DATABASE_URL (for running migrations)
# - SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD (for automated confirmation emails)

# Run the backend server
python run.py
```
*The API will be available at `http://localhost:8000`. API documentation is available at `http://localhost:8000/docs`.*

### 3. Frontend Setup (React/Vite)
Open a **new** terminal and navigate to the `frontend` folder:
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The frontend will run at `http://localhost:5173`. It is configured to automatically connect to the backend at `http://localhost:8000` locally.*

---

## 🌍 Production Deployment

The project is fully pre-configured for modern deployment platforms.

### Database: Supabase
1. Create a PostgreSQL project on Supabase.
2. Obtain your Connection String (URI) and API credentials.

### Backend: Render
1. Connect your GitHub repository to Render as a **Web Service**.
2. Render will automatically provision a Python web service (detecting the `render.yaml` or Docker configuration if present).
3. In the Render dashboard, configure your environment variables from `backend/.env` (including Supabase, Admin seed credentials, and SMTP settings).

### Frontend: Vercel
1. Connect your repository to Vercel and select the `frontend` folder as the Root Directory.
2. Vercel will auto-detect the Vite framework.
3. In the Vercel Environment Variables, set `VITE_API_URL` to your newly created live Render API URL, along with your Supabase credentials.
4. Deploy! The included `vercel.json` ensures React Router SPA behaviors work perfectly.

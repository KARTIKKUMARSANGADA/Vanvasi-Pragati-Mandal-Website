# Vanvasi Pragati Mandal (VPM) - NGO Platform

A modern, full-stack web platform built for the Vanvasi Pragati Mandal (VPM) NGO. It features a stunning, dynamic public-facing website and a secure, powerful Admin Dashboard for managing projects and gallery assets.

## 🚀 Tech Stack

### Frontend
*   **Framework:** React + Vite
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Routing:** React Router DOM
*   **Icons:** Lucide React

### Backend
*   **Framework:** FastAPI (Python)
*   **Database:** SQLite (Local) / PostgreSQL (Production via Supabase)
*   **ORM:** SQLAlchemy
*   **Authentication:** JWT + bcrypt password hashing

---

## 💻 Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Webiste_Trust
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

# Create a .env file based on the required variables
echo "SECRET_KEY=your_super_secret_key" > .env
echo "DATABASE_URL=sqlite:///./database.db" >> .env

# Run the backend server
uvicorn app.main:app --reload --port 8000
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
*The frontend will run at `http://localhost:5173`. It is configured to automatically connect to `http://localhost:8000` locally.*

---

## 🌍 Production Deployment

The project is fully pre-configured for modern deployment platforms.

### Database: Supabase
1. Create a PostgreSQL project on Supabase.
2. Obtain your Connection String (URI).

### Backend: Render
1. Connect your GitHub repository to Render as a **Blueprint** (it will auto-detect the `render.yaml` file).
2. Render will automatically provision a Python web service and attach a persistent disk for handling local file uploads.
3. In the Render dashboard, set the `DATABASE_URL` environment variable to your Supabase Connection String.

### Frontend: Vercel
1. Connect your repository to Vercel and select the `frontend` folder as the Root Directory.
2. Vercel will auto-detect the Vite framework.
3. In the Vercel Environment Variables, set `VITE_BACKEND_URL` to your newly created live Render URL.
4. Deploy! The included `vercel.json` ensures React Router SPA behaviors work perfectly.

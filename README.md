# Vanvasi Pragati Mandal (VPM) - NGO Platform

![NGO Website Mockup](https://raw.githubusercontent.com/KARTIKKUMARSANGADA/Vanvasi-Pragati-Mandal-Website/master/public/hero-bg.png)

A state-of-the-art, full-stack digital platform built for **Vanvasi Pragati Mandal (Pipaliya)**. This platform empowers the NGO to showcase its tribal welfare projects, manage its digital assets, and engage with supporters globally through a premium, high-performance web experience.

## ✨ Premium Features

- **🚀 Cinematic UI/UX**: Built with React, Tailwind CSS, and Framer Motion for buttery-smooth animations and a modern aesthetic.
- **📊 Admin Analytics**: Real-time dashboard with message engagement charts and project statistics.
- **💬 WhatsApp Integration**: Floating contact button with smart-pulsing animation for instant support.
- **🔍 Advanced Search**: Live search and filtering for projects and gallery assets in the Admin Panel.
- **🖼️ Filterable Gallery**: Interactive photo gallery categorized by project type (Education, Health, etc.).
- **⚡ Performance First**: Optimized with Skeleton screens, lazy-loaded images, and SEO-ready meta tags.
- **🛡️ Secure Admin**: JWT-protected authentication for managing sensitive organizational data.

## 🚀 Tech Stack

### Frontend
- **Core:** React 18 + Vite
- **Styling:** Vanilla CSS + Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **SEO:** React Helmet Async
- **Charts:** Recharts

### Backend
- **Core:** FastAPI (Python)
- **Database:** PostgreSQL (Supabase)
- **Email:** SMTP Service for contact notifications
- **Auth:** JWT + Bcrypt Hashing

---

## 💻 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KARTIKKUMARSANGADA/Vanvasi-Pragati-Mandal-Website.git
cd Vanvasi-Pragati-Mandal-Website
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
# Copy .env.example to .env and fill in your Supabase & SMTP keys
uvicorn app.main:app --reload
```

### 3. Frontend Setup (React/Vite)
```bash
cd frontend
npm install
# Copy .env.example to .env and fill in your Supabase URL & Key
npm run dev
```

---

## 🌎 Deployment

- **Frontend:** Optimized for **Vercel** or Netlify.
- **Backend:** Optimized for **Render** or DigitalOcean.
- **Database:** Hosted on **Supabase**.

## 📄 License
Copyright © 2026 Vanvasi Pragati Mandal. All rights reserved.

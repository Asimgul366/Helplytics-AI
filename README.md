# Helplytics AI — Community Support Platform

MERN Stack (React + Node.js + Express + MongoDB + Tailwind CSS)

## Quick Start

### 1. Setup Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MONGODB_URI and JWT_SECRET
npm run seed    # populate dummy data
npm run dev     # start backend on port 5000
```

### 2. Setup Client

```bash
cd client
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000/api
npm run dev     # start frontend on port 5173
```

Open http://localhost:5173

### Demo Login
- Email: `ayesha@helplytics.ai` / Password: `password123`
- Email: `hassan@helplytics.ai` / Password: `password123`
- Email: `sara@helplytics.ai` / Password: `password123`

---

## Deploy to Vercel + Railway

### Frontend (Vercel)
1. Push `client/` folder to GitHub
2. Import in Vercel → set root directory to `client`
3. Add env var: `VITE_API_URL=https://your-railway-url/api`
4. Deploy

### Backend (Railway)
1. Push `server/` folder to GitHub
2. New project in Railway → Deploy from GitHub
3. Add env vars: `MONGODB_URI`, `JWT_SECRET`, `PORT=5000`
4. Deploy

---

## Pages
- `/` — Landing
- `/auth` — Login / Signup
- `/onboarding` — Profile setup
- `/dashboard` — Main dashboard
- `/explore` — Browse & filter requests
- `/create-request` — Create help request with AI
- `/requests/:id` — Request detail
- `/messages` — Messaging
- `/leaderboard` — Top helpers
- `/ai-center` — AI insights
- `/notifications` — Notification feed
- `/profile` — User profile

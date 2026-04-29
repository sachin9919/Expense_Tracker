# Expense Tracker

A production-grade, industrial-strength expense tracker with a glassmorphism UI.

## Features
- **Frontend**: React + Vite + Tailwind CSS (v4) with dark glassmorphism theme.
- **Backend**: Node.js + Express + TypeScript.
- **Database**: SQLite (better-sqlite3) for persistence.
- **Caching**: Redis (ioredis) for high-performance GET requests.
- **Idempotency**: UUID-based idempotency keys for resilient POST requests.
- **Rate Limiting**: Protection against API abuse.

## Local Development

### Prerequisites
- Node.js (v18+)
- Redis server (local or Upstash)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   # Backend
   cd backend && npm install
   # Frontend
   cd ../frontend && npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` in both folders).
4. Start development:
   ```bash
   # Backend
   cd backend && npm run dev
   # Frontend
   cd ../frontend && npm run dev
   ```

## Deployment

### Backend (Render.com)
1. Push this repo to GitHub.
2. Create a new **Web Service** on Render.
3. Select your repository.
4. Render will automatically detect the `render.yaml` file.
5. Provide the following environment variables in the Render dashboard:
   - `REDIS_URL`: Your Upstash Redis connection string.
   - `FRONTEND_URL`: The URL where your frontend is deployed (e.g., `https://your-app.vercel.app`).
6. Ensure the disk is mounted at `/data` (handled by `render.yaml`).

### Frontend (Vercel)
1. Push this repo to GitHub.
2. Import the project into Vercel.
3. Set the **Root Directory** to `frontend`.
4. Add the environment variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-api.onrender.com`).
5. Deploy!

# 💰 ExpenseTracker - Industrial Strength SaaS

A premium, full-stack expense management application built with **React 19**, **Vite 8**, **Tailwind CSS 4**, and **Node.js**. This project is designed for high performance, security, and financial accuracy.

## 🚀 Live Demo
- **Frontend**: [https://expense-tracker-nu-hazel.vercel.app](https://expense-tracker-nu-hazel.vercel.app)
- **Backend API**: [https://expense-tracker-backend-v5s1.onrender.com](https://expense-tracker-backend-v5s1.onrender.com)

---

## ✨ Key Features

### 🔐 User Management & Security
- **JWT Authentication**: Secure signup and login workflows.
- **Private Data Isolation**: Each user manages their own independent expense data.
- **Protected Routes**: Frontend routing ensures only logged-in users access the dashboard.
- **Bcrypt Hashing**: Industry-standard password security.

### 🎨 Premium Aesthetics
- **Glassmorphism UI**: Stunning frosted glass effects with dynamic blurs.
- **Animated Backgrounds**: Smooth gradient mesh background for a premium feel.
- **Responsive Design**: Optimized for everything from mobile phones to ultra-wide monitors.
- **Global Toast System**: Real-time feedback for all user actions.

### ⚙️ High-Performance Architecture
- **PostgreSQL Persistence**: Managed database on Render for reliable data storage.
- **Redis Caching**: Support for ultra-fast data retrieval via ioredis.
- **Idempotency Control**: UUID-based tracking prevents duplicate submissions.
- **Rate Limiting**: Built-in protection against API abuse and brute-force attacks.

### 📊 Financial Insights
- **Integer Precision**: All calculations are performed in "paise" to avoid JavaScript floating-point errors.
- **Category Breakdown**: Real-time summary charts and spending analysis.
- **Advanced Filtering**: Sort by date and filter by category (Food, Health, Transport, etc.).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router 7
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (pg)
- **Caching**: Redis (ioredis)
- **Security**: Helmet, Express Rate Limit, JWT, Bcrypt

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/sachin9919/Expense_Tracker.git
cd Expense_Tracker
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file with:
# DATABASE_URL=your_postgres_connection_string
# JWT_SECRET=your_secret
# REDIS_URL=your_redis_url (optional)
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
# Create a .env file with:
# VITE_API_URL=http://localhost:3000
npm run dev
```

---

## 🌍 Deployment

### Backend (Render)
1. Use the included `render.yaml` Blueprint.
2. Connect your GitHub repo.
3. Render will automatically provision a PostgreSQL database and a Web Service.

### Frontend (Vercel)
1. Import the repository to Vercel.
2. Set the root directory to `frontend`.
3. Add the `VITE_API_URL` environment variable.

---

## 📄 License
This project is licensed under the MIT License.

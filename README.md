# 💸 Money Man — Smart Mobile Personal Finance Tracker

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://mongodb.com)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-00ED64.svg)](https://cloud.mongodb.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20App-38bdf8.svg)](#-install-on-mobile-phone-as-an-app)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

> **Money Man** is a full-stack, mobile-first personal finance and expense tracker engineered for real Indian banking workflows (KVB, Google Pay, Supermoney, and Cash Wallet). It supports **automatic and bulk SMS history import**, smart categorization, multi-account balancing, and is **100% installable as a mobile app (PWA)** on iOS and Android.

---

## 🚀 Live Demo & Deployment

- **Live Web App**: [https://money-man.vercel.app](https://money-man.vercel.app) *(Replace with your deployed Vercel URL)*
- **Cloud Database**: Hosted on **MongoDB Atlas** (`Cluster0` / `money_man`)

---

## ✨ Key Features

- **📱 Installable Mobile App (PWA)**:
  - Installs directly onto your iPhone or Android home screen without needing the App Store.
  - Runs in standalone fullscreen mode with smooth animations and dark mode aesthetic.
  - Instant loading and offline caching via background Service Worker.

- **🏦 Smart Bank SMS Engine (KVB & UPI)**:
  - **Bulk History Import**: Copy and paste months of messages from Google Messages in one batch.
  - **Accurate Date Extraction**: Automatically parses exact historical transaction dates (e.g. `18-Oct-26`).
  - **Duplicate Prevention**: Built-in fingerprint check skips already recorded transactions.
  - **Hands-Free Auto-Sync**: Background webhook receiver compatible with **MacroDroid** or Tasker.

- **🍃 Cloud Persistence (MongoDB Atlas)**:
  - Real-time cloud storage powered by Mongoose schemas.
  - Multi-user authentication (JWT with bcrypt password hashing).
  - Multi-profile support (separate tracking for Personal, Family, and Trips).

- **📊 Visual Analytics & Smart Insights**:
  - Live category expenditure breakdown (Dining, Fuel, Bills, Groceries, Shopping, etc.).
  - Payment source distribution (KVB Bank Account, Google Pay, Supermoney, Cash).
  - Intelligent suggestions based on savings rate and 50/30/20 money rules.

---

## 📱 Install on Mobile Phone as an App

You can install Money Man directly to your phone's home screen:

### On iPhone (Safari):
1. Open the app link in **Safari**.
2. Tap the **Share** button (**⎋**) at the bottom of the screen.
3. Scroll down and tap **"Add to Home Screen"** (**➕**).
4. Tap **Add** in the top right. Money Man will appear on your home screen like a native app!

### On Android (Chrome / Edge / Firefox):
1. Open the app link in **Chrome**.
2. Tap the **"App"** download button in the top header (or tap the **3 dots ⋮** in Chrome).
3. Tap **"Install App"** or **"Add to Home screen"**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS (Glassmorphism design system)
- **Backend**: Node.js, Express.js (Modular REST API + Serverless Vercel function)
- **Database**: MongoDB Atlas Cloud (`mongoose` ODM)
- **Auth**: JSON Web Tokens (JWT) + `bcryptjs`
- **Mobile PWA**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`), Apple Touch Icon

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/Kumaran172/Money_Man.git
cd Money_Man
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/money_man?retryWrites=true&w=majority
```

### 3. Install Dependencies & Run Locally
```bash
# In one terminal: Start the backend server
cd server
npm install
npm start

# In another terminal: Start the frontend Vite app
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## ☁️ Deploy to Vercel (Step-by-Step)

1. Push your code to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New..."** → **"Project"** → Select your `Money_Man` repository.
4. In the **Environment Variables** section, add:
   - `MONGODB_URI`: `mongodb+srv://Kumaran:MoneyMan%40123@cluster0.i2twkeq.mongodb.net/money_man?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_random_secret_string`
5. Click **Deploy**. Vercel will build the Vite client and deploy the Express API automatically!

---

## 📄 License

MIT License © 2026 Kumaran

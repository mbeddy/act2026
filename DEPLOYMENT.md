# Deployment Guide — Africa Coffee & Tea Expo Dashboard

## Architecture Overview

This app has two parts that are deployed separately:

| Part | Platform | Why |
|------|----------|-----|
| **Frontend** (webapp/) | **Vercel** | Perfect for React/Vite static sites |
| **Backend** (backend/) | **Railway** | Supports Bun runtime + persistent file storage |

> **Why not backend on Vercel?**
> Vercel uses serverless functions which have no persistent filesystem — your dashboard data (JSON files) would be wiped on every request. Railway keeps the filesystem alive like a normal server.

---

## Prerequisites

- A [GitHub](https://github.com) account (free)
- A [Vercel](https://vercel.com) account (free) — sign in with GitHub
- A [Railway](https://railway.app) account (free tier available) — sign in with GitHub
- Your code pushed to a GitHub repository

---

## Step 1 — Push Code to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `expo-dashboard`)
2. Set it to **Private**
3. Run these commands in your project folder:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/expo-dashboard.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2 — Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and click **Start a New Project**
2. Choose **Deploy from GitHub repo**
3. Select your repository
4. When prompted for the **Root Directory**, set it to: `backend`
5. Railway will auto-detect Bun and use the `railway.toml` config

### Set Backend Environment Variables

In Railway, go to your service → **Variables** tab, and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `ADMIN_PASSWORD` | `YourSecurePassword123!` | **Change this!** Admin panel login |
| `JWT_SECRET` | `a-long-random-secret-string` | **Change this!** Use 32+ random characters |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Set after Step 3 (Vercel URL) |
| `SMTP_HOST` | `smtp.gmail.com` | Optional — for email notifications |
| `SMTP_PORT` | `587` | Optional |
| `SMTP_USER` | `your@gmail.com` | Optional |
| `SMTP_PASS` | `your-app-password` | Optional — Gmail App Password |
| `SMTP_FROM` | `noreply@yourdomain.com` | Optional |

6. Click **Deploy**. Wait for the green ✅ status.
7. Copy your Railway backend URL — it looks like: `https://backend-production-xxxx.up.railway.app`

---

## Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
2. Import your GitHub repository
3. In the **Configure Project** screen:
   - Set **Root Directory** to: `webapp`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist`

### Set Frontend Environment Variables

In Vercel, expand **Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_BACKEND_URL` | `https://backend-production-xxxx.up.railway.app` | Your Railway URL from Step 2 |

4. Click **Deploy**. Wait for the build to complete.
5. Copy your Vercel URL — it looks like: `https://expo-dashboard.vercel.app`

---

## Step 4 — Connect Frontend ↔ Backend

1. Go back to **Railway** → your backend service → **Variables**
2. Update `FRONTEND_URL` to your actual Vercel URL (e.g. `https://expo-dashboard.vercel.app`)
3. Railway will automatically redeploy

---

## Step 5 — Test the Deployment

1. Open your Vercel URL in the browser — the dashboard should load
2. Navigate to `/admin` — log in with your `ADMIN_PASSWORD`
3. Make a change in the Admin panel and save — the data should persist

---

## Custom Domain (Optional)

### On Vercel:
1. Go to your project → **Settings → Domains**
2. Add your domain (e.g. `dashboard.yourdomain.com`)
3. Follow the DNS instructions to point your domain to Vercel

### On Railway (for the backend):
1. Go to your service → **Settings → Networking**
2. Click **Generate Domain** or add a custom domain
3. Update `FRONTEND_URL` in Railway variables and `VITE_BACKEND_URL` in Vercel variables

---

## Environment Variables Summary

### Backend (Railway)
```
PORT=3000                          # Auto-set by Railway
ADMIN_PASSWORD=YourSecurePassword  # Required — change from default!
JWT_SECRET=YourLongRandomSecret    # Required — change from default!
FRONTEND_URL=https://your-app.vercel.app  # Required for CORS
SMTP_HOST=smtp.gmail.com           # Optional — email notifications
SMTP_PORT=587                      # Optional
SMTP_USER=your@email.com           # Optional
SMTP_PASS=your-app-password        # Optional
SMTP_FROM=noreply@yourdomain.com   # Optional
```

### Frontend (Vercel)
```
VITE_BACKEND_URL=https://your-backend.up.railway.app
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Dashboard shows blank/loading forever | Check `VITE_BACKEND_URL` is correct in Vercel |
| Admin login fails | Check `ADMIN_PASSWORD` is set in Railway |
| CORS errors in browser console | Check `FRONTEND_URL` matches your Vercel URL exactly (no trailing slash) |
| Data not saving | Check Railway service is running (green status) |
| Email notifications not working | Verify SMTP variables; for Gmail use an [App Password](https://support.google.com/accounts/answer/185833) |

---

## Files Created for Deployment

- `webapp/vercel.json` — Configures Vercel SPA routing (React Router support)
- `backend/railway.toml` — Configures Railway build and deploy settings

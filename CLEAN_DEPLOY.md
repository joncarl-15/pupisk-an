# 🚀 Clean Deployment Guide (Start Here)

If you're facing issues, follow this guide to start fresh with your deployment.

## Step 1: Clean Up Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. **Delete** any existing projects related to this app (e.g., `pupisk-an`, `attendance-mern`).
   - Click on the project → Settings → General → Scroll down to "Delete Project".

---

## Step 2: Deploy Backend (Server)

1. Go to [Vercel New Project](https://vercel.com/new).
2. **Import** your `pupisk-an` repository.
3. **Configure Project:**
   - **Project Name:** `pupisk-an-server` (or similar)
   - **Framework Preset:** Other
   - **Root Directory:** Click `Edit` and select `server`. **(Crucial Step!)**
4. **Environment Variables:**
   - Expand "Environment Variables".
   - Add `MONGODB_URI` with your connection string.
5. Click **Deploy**.
6. **Wait** for deployment to finish.
7. **Copy** the domain (e.g., `https://pupisk-an-server.vercel.app`).

---

## Step 3: Deploy Frontend (Client)

1. Go to [Vercel New Project](https://vercel.com/new) again.
2. **Import** the SAME `pupisk-an` repository again.
3. **Configure Project:**
   - **Project Name:** `pupisk-an-client`
   - **Framework Preset:** Vite
   - **Root Directory:** Click `Edit` and select `client`. **(Crucial Step!)**
4. **Environment Variables:**
   - Add `VITE_API_URL` with the backend URL you copied in Step 2.
   - Example: `https://pupisk-an-server.vercel.app/api` (Make sure to add `/api` at the end!)
5. Click **Deploy**.

---

## Step 4: Finalize

1. Open your **Frontend URL** (e.g., `https://pupisk-an-client.vercel.app`).
2. It should now work perfectly!
3. If you see a CORS error (red error in console), you might need to update `server/index.js` to allow your specific frontend URL, but for now, it should work as we have `app.use(cors())` enabled.

---

### 💡 Why this works:
- We separate the Backend and Frontend into two different Vercel projects.
- We explicitly tell Vercel which folder (`server` or `client`) to use for each.
- This prevents the 404 errors caused by Vercel looking for files in the wrong place.

# Deployment Guide - Vercel

This guide will walk you through deploying the Iska-Fest Attendance System to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (free)
- [Git](https://git-scm.com/) installed
- [Vercel CLI](https://vercel.com/cli) (optional but recommended)

---

## Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Set role to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Vercel
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `attendance`
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/attendance?retryWrites=true&w=majority`

---

## Step 2: Prepare Your Code

1. **Push to GitHub** (if not already done)
```bash
cd attendance-mern
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/attendance-mern.git
git push -u origin main
```

2. **Verify files exist:**
   - ✅ `server/vercel.json`
   - ✅ `server/.env.example`
   - ✅ `client/.env.example`

---

## Step 3: Deploy Backend to Vercel

### Option A: Using Vercel Dashboard (Recommended for beginners)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Connect your GitHub account
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Other
   - **Root Directory:** `server`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - Name: `MONGODB_URI`
     - Value: Your MongoDB Atlas connection string
     - Environment: Production, Preview, Development (select all)
   - Add:
     - Name: `PORT`
     - Value: `5000`
     - Environment: Production, Preview, Development (select all)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://attendance-backend.vercel.app`)

### Option B: Using Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy Backend**
```bash
cd server
vercel
```

4. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name? `attendance-backend`
   - Directory? `./`
   - Override settings? `N`

5. **Add environment variables**
```bash
vercel env add MONGODB_URI
# Paste your MongoDB connection string
# Select Production, Preview, Development

vercel env add PORT
# Enter: 5000
# Select Production, Preview, Development
```

6. **Deploy to production**
```bash
vercel --prod
```

7. **Copy your backend URL**

---

## Step 4: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard

1. **Import Repository Again**
   - Click "Add New..." → "Project"
   - Select same repository
   - Click "Import"

2. **Configure Project**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - Name: `VITE_API_URL`
     - Value: `https://your-backend-url.vercel.app/api`
     - Environment: Production, Preview, Development (select all)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app is now live!

### Option B: Using Vercel CLI

1. **Create production environment file**
```bash
cd client
cp .env.example .env.production
```

2. **Edit `.env.production`**
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

3. **Deploy Frontend**
```bash
vercel
```

4. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name? `attendance-frontend`
   - Directory? `./`
   - Override settings? `Y`
   - Build command? `npm run build`
   - Output directory? `dist`

5. **Deploy to production**
```bash
vercel --prod
```

---

## Step 5: Update CORS Configuration

1. **Edit `server/index.js`**

Find the CORS configuration and update:
```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-frontend-url.vercel.app'  // Add your frontend URL
    ],
    credentials: true
}));
```

2. **Redeploy Backend**
```bash
cd server
git add .
git commit -m "Update CORS configuration"
git push
```

Or using Vercel CLI:
```bash
cd server
vercel --prod
```

---

## Step 6: Test Your Deployment

1. **Visit your frontend URL**
   - Example: `https://attendance-frontend.vercel.app`

2. **Test all features:**
   - ✅ Dashboard loads
   - ✅ Generate QR codes
   - ✅ QR scanner works (requires HTTPS)
   - ✅ Registration form
   - ✅ Attendee management
   - ✅ Reports and export

3. **Check browser console for errors**

---

## Troubleshooting

### CORS Error
**Problem:** Frontend can't connect to backend

**Solution:**
1. Verify `VITE_API_URL` in frontend environment variables
2. Check CORS configuration in `server/index.js`
3. Ensure frontend URL is added to CORS origins
4. Redeploy backend after changes

### MongoDB Connection Error
**Problem:** Backend can't connect to MongoDB

**Solution:**
1. Verify `MONGODB_URI` in backend environment variables
2. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
3. Verify database user credentials
4. Test connection string locally first

### QR Scanner Not Working
**Problem:** Camera doesn't activate

**Solution:**
1. Ensure you're using HTTPS (Vercel provides this automatically)
2. Grant camera permissions in browser
3. Try different browser (Chrome recommended)
4. Check browser console for errors

### Build Failed
**Problem:** Deployment fails during build

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Test build locally: `npm run build`
4. Check for TypeScript/ESLint errors

### Environment Variables Not Working
**Problem:** App can't read environment variables

**Solution:**
1. Verify variable names (must start with `VITE_` for frontend)
2. Check they're set for correct environment (Production/Preview/Development)
3. Redeploy after adding variables
4. Clear Vercel cache: `vercel --force`

---

## Custom Domain (Optional)

1. **Go to Project Settings**
   - Select your frontend project
   - Go to "Domains"

2. **Add Domain**
   - Click "Add"
   - Enter your domain (e.g., `attendance.yourdomain.com`)
   - Follow DNS configuration instructions

3. **Update CORS**
   - Add custom domain to CORS origins in backend
   - Redeploy backend

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Make changes locally**
```bash
git add .
git commit -m "Your changes"
git push
```

2. **Vercel automatically:**
   - Detects the push
   - Builds your project
   - Deploys to production
   - Provides preview URL for branches

---

## Monitoring and Logs

1. **View Logs**
   - Go to Vercel Dashboard
   - Select your project
   - Click "Deployments"
   - Click on a deployment
   - View "Build Logs" or "Function Logs"

2. **Analytics**
   - Go to "Analytics" tab
   - View traffic, performance, and errors

---

## Cost Estimation

**Free Tier Includes:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ MongoDB Atlas M0 (512MB storage)

**This is completely FREE for small to medium projects!**

---

## Next Steps

1. ✅ Set up custom domain
2. ✅ Configure email notifications
3. ✅ Set up monitoring/alerts
4. ✅ Add backup strategy for MongoDB
5. ✅ Implement authentication (if needed)

---

## Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check MongoDB Atlas docs: https://docs.atlas.mongodb.com
3. Review deployment logs in Vercel dashboard
4. Test locally first before deploying

---

**Congratulations! Your attendance system is now live! 🎉**

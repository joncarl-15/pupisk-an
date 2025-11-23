# Quick Start Guide

Get the Iska-Fest Attendance System running in 5 minutes!

## 🚀 Local Development

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Set Up Environment Variables

**Backend** (`server/.env`):
```bash
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance
```

### 3. Start MongoDB

Make sure MongoDB is running locally:
```bash
# If using MongoDB service
sudo systemctl start mongodb

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the App

Open your browser and go to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 🌐 Deploy to Vercel (Production)

### Quick Deploy

1. **Set up MongoDB Atlas** (free tier)
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create cluster and get connection string

2. **Deploy Backend:**
```bash
cd server
vercel
# Add MONGODB_URI when prompted
```

3. **Deploy Frontend:**
```bash
cd client
# Create .env.production with your backend URL
echo "VITE_API_URL=https://your-backend.vercel.app/api" > .env.production
vercel
```

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

---

## ✅ First Steps After Setup

1. **Generate QR Codes**
   - Go to "QR Codes" → "Generate QR"
   - Create 10 codes with label "Test Batch"

2. **Test Scanner**
   - Go to "Scan QR"
   - Click "Start Scanner"
   - Scan a generated QR code

3. **Register Attendee**
   - Scan QR or open registration link
   - Fill in the form
   - Submit

4. **Check Dashboard**
   - View statistics
   - See recent check-ins

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production Build
npm run build        # Build for production
npm start           # Run production build

# Deployment
vercel              # Deploy to Vercel
vercel --prod       # Deploy to production
```

---

## 📚 Learn More

- [Full README](README.md) - Complete documentation
- [Deployment Guide](DEPLOYMENT.md) - Step-by-step Vercel deployment
- [API Documentation](README.md#-api-endpoints) - API reference

---

## 🆘 Need Help?

**Common Issues:**

1. **MongoDB connection error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **CORS error**
   - Verify API URL in frontend
   - Check CORS config in backend

3. **QR scanner not working**
   - Use HTTPS (required for camera)
   - Grant camera permissions

**For more troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)**

---

**Ready to go! 🎉**

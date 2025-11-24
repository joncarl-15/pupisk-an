# Iska-Fest Attendance System (MERN Stack)

A modern, full-stack attendance management system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring QR code generation, live camera scanning, and automatic check-in/check-out functionality.

![Glassmorphism Design](https://img.shields.io/badge/Design-Glassmorphism-orange)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 📊 Dashboard
- Real-time statistics (Total QR Codes, Registered Attendees, Available Slots)
- Recent check-ins table
- Quick action buttons

### 🎫 QR Code Management
- Batch QR code generation (1-3000 codes)
- Custom batch labels
- Download individual QR codes
- **Download all QR codes as printable PDF**
- **Delete all unused QR codes**
- Status tracking (Generated/Registered)

### 📷 QR Scanner
- Live camera QR code scanning
- Manual start/stop controls
- QR alignment box overlay
- **Automatic check-in/check-out system:**
  - First scan → Register/Time In
  - Second scan → Automatic Time Out
  - Third scan → Already checked out notification

### 📝 Registration
- Public registration form via QR code
- Course selection (23+ courses)
- Year level selection
- Contact information capture
- Already registered state display

### 👥 Attendee Management
- Search by name, course, or QR code
- Edit attendee information
- Delete attendees
- Export to Excel (.xlsx format)

### 📈 Reports
- Date range filtering
- Total check-ins statistics
- Top courses breakdown
- Export filtered data to Excel

### 🎨 Design
- Modern glassmorphism UI
- Dark gradient background
- Responsive mobile design
- Toast notifications
- Smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd attendance-mern
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance
```

5. **Start the development servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 📁 Project Structure

```
attendance-mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🌐 Deployment to Vercel

### Step 1: Prepare for Deployment

1. **Set up MongoDB Atlas** (if not already done)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
   - Whitelist all IPs (0.0.0.0/0) for Vercel

2. **Update server for production**

Create `server/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

3. **Update client API configuration**

Edit `client/src/api/axios.js`:
```javascript
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
})

export default api
```

Create `client/.env.production`:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### Step 2: Deploy Backend to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy backend**
```bash
cd server
vercel
```

3. **Set environment variables in Vercel**
   - Go to your project on Vercel dashboard
   - Settings → Environment Variables
   - Add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `PORT`: 5000

4. **Note your backend URL** (e.g., `https://your-backend.vercel.app`)

### Step 3: Deploy Frontend to Vercel

1. **Update API URL**

Edit `client/.env.production`:
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

2. **Deploy frontend**
```bash
cd client
vercel
```

3. **Set to production**
```bash
vercel --prod
```

### Step 4: Configure CORS

Update `server/index.js` to allow your frontend domain:
```javascript
app.use(cors({
    origin: ['http://localhost:5173', 'https://your-frontend.vercel.app'],
    credentials: true
}));
```

Redeploy backend:
```bash
cd server
vercel --prod
```

---

## 🔧 Alternative Deployment Options

### Deploy as Monorepo (Single Vercel Project)

1. **Create `vercel.json` in root:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

2. **Deploy from root:**
```bash
vercel
```

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance
NODE_ENV=development
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

---

## 🛠️ Technologies Used

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **html5-qrcode** - QR code scanning
- **date-fns** - Date formatting
- **react-hot-toast** - Notifications
- **Bootstrap** - CSS framework

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **xlsx** - Excel file generation
- **qrcode** - QR code generation

---

## 📖 API Endpoints

### QR Codes
- `POST /api/qrcodes/generate` - Generate batch of QR codes
- `GET /api/qrcodes` - Get all QR codes
- `GET /api/qrcodes/:code` - Get single QR code
- `DELETE /api/qrcodes/generated/all` - Delete all unused QR codes
- `DELETE /api/qrcodes` - Delete all QR codes and attendees

### Attendees
- `POST /api/attendees` - Register attendee / Check-out
- `GET /api/attendees` - Get all attendees
- `GET /api/attendees/export` - Export to Excel (.xlsx)
- `PUT /api/attendees/:id` - Update attendee
- `DELETE /api/attendees/:id` - Delete attendee

---

## 🎯 Usage Guide

### 1. Generate QR Codes
1. Go to "QR Codes" page
2. Enter quantity (1-3000) and optional batch label
3. Click "Generate Codes"
4. Download individual codes or all as PDF

### 2. Scan QR Codes
1. Go to "Scan QR" page
2. Click "Start Scanner"
3. Grant camera permission
4. Align QR code in the box
5. First scan → Redirects to registration
6. Second scan → Automatic time-out

### 3. Register Attendees
1. Scan QR code or open registration link
2. Fill in required information
3. Submit form
4. Attendee is now registered with time-in

### 4. Manage Attendees
1. Go to "Attendees" page
2. Search, edit, or delete attendees
3. Export data to Excel

### 5. Generate Reports
1. Go to "Reports" page
2. Select date range
3. View statistics
4. Download Excel report

---

## 🐛 Troubleshooting

### QR Scanner not working
- Ensure HTTPS connection (required for camera access)
- Grant camera permissions in browser
- Try different browser (Chrome recommended)

### MongoDB Connection Error
- Check MongoDB is running
- Verify connection string in `.env`
- For Atlas: Check IP whitelist

### CORS Error
- Verify backend URL in frontend `.env`
- Check CORS configuration in `server/index.js`

---

## 📄 License

MIT License - feel free to use this project for your needs!

---

## 👨‍💻 Author

Created for Iska-Fest Attendance Management

---

## 🙏 Acknowledgments

- QR code generation powered by [QR Server API](https://goqr.me/api/)
- Icons and design inspired by modern glassmorphism trends
- Built with ❤️ using the MERN stack

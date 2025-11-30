require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Note: We don't connect to mongoose here immediately anymore for Vercel
// But for local dev server (node index.js), we might want to.
// However, the best practice for Vercel is to connect *inside* the route handlers or via middleware.
// To keep it simple and compatible with both:
const dbConnect = require('./utils/dbConnect').default; // Note: using .default because dbConnect is ESM style but this file is CJS

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Attendance API is running');
});

const qrRoutes = require('./routes/qrcodes');
const attendeeRoutes = require('./routes/attendees');

// Middleware to ensure DB is connected for all API routes
app.use('/api', async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'Database connection failed' });
    }
});

app.use('/api/qrcodes', qrRoutes);
app.use('/api/attendees', attendeeRoutes);

// Only listen if not running on Vercel (Vercel exports the app)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

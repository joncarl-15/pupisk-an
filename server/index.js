require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_mern', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Attendance API is running');
});

const qrRoutes = require('./routes/qrcodes');
const attendeeRoutes = require('./routes/attendees');

app.use('/api/qrcodes', qrRoutes);
app.use('/api/attendees', attendeeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

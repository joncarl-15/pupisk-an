const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Verify password
router.post('/verify', async (req, res) => {
    try {
        const { password } = req.body;
        const admin = await Admin.findOne();

        if (!admin) {
            return res.status(404).json({ message: 'Admin not initialized' });
        }

        if (password === admin.password) {
            res.json({ success: true, message: 'Access granted' });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

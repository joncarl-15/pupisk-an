const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const Attendee = require('../models/Attendee');
const qrcode = require('qrcode');
const crypto = require('crypto');

// Generate batch of QR codes
router.post('/generate', async (req, res) => {
    try {
        const { quantity, label } = req.body;
        const qty = parseInt(quantity);

        if (!qty || qty < 1 || qty > 200) {
            return res.status(400).json({ message: 'Quantity must be between 1 and 200' });
        }

        const createdCodes = [];
        for (let i = 0; i < qty; i++) {
            const token = crypto.randomBytes(5).toString('hex').toUpperCase();
            // Check for collision (rare but possible)
            const existing = await QRCode.findOne({ code: token });
            if (existing) {
                i--;
                continue;
            }

            createdCodes.push({
                code: token,
                label: label || ''
            });
        }

        await QRCode.insertMany(createdCodes);
        res.status(201).json({ message: `Successfully generated ${createdCodes.length} QR codes`, count: createdCodes.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all QR codes (with attendee info)
router.get('/', async (req, res) => {
    try {
        const qrcodes = await QRCode.find().sort({ created_at: -1 }).limit(100);
        // Fetch attendee info for each registered QR
        // This is a simple implementation; for large datasets, use aggregation
        const results = await Promise.all(qrcodes.map(async (qr) => {
            let attendee = null;
            if (qr.status === 'registered') {
                attendee = await Attendee.findOne({ qr_code_id: qr._id });
            }
            return {
                ...qr.toObject(),
                attendee
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single QR code by code string (for scanning)
router.get('/:code', async (req, res) => {
    try {
        const qr = await QRCode.findOne({ code: req.params.code });
        if (!qr) {
            return res.status(404).json({ message: 'QR Code not found' });
        }

        let attendee = null;
        if (qr.status === 'registered') {
            attendee = await Attendee.findOne({ qr_code_id: qr._id });
        }

        res.json({
            ...qr.toObject(),
            attendee
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete all generated (unused) QR codes
router.delete('/generated/all', async (req, res) => {
    try {
        const result = await QRCode.deleteMany({ status: 'generated' });
        res.json({
            message: `Successfully deleted ${result.deletedCount} generated QR code(s).`,
            count: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete ALL QR codes and attendees
router.delete('/', async (req, res) => {
    try {
        await QRCode.deleteMany({});
        await Attendee.deleteMany({});
        res.json({ message: 'All data has been deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

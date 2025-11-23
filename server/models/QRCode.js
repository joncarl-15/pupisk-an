const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    label: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['generated', 'registered'],
        default: 'generated'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);

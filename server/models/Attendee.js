const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
    qr_code_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        required: true
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    student_number: {
        type: String,
        trim: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    year_level: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    contact_number: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    },
    time_in: {
        type: Date,
        default: null
    },
    time_out: {
        type: Date,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Attendee', attendeeSchema);

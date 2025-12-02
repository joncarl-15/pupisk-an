const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const QRCode = require('../models/QRCode');

const { Parser } = require('json2csv');

// Register an attendee or Check-out
router.post('/', async (req, res) => {
    try {
        const { qr_code_id, full_name, student_number, course, year_level, email, contact_number, remarks } = req.body;

        // Validate QR code
        const qr = await QRCode.findById(qr_code_id);
        if (!qr) {
            return res.status(404).json({ message: 'QR Code not found' });
        }

        // Attendance Logic (3-Step Flow)
        if (qr.status === 'registered') {
            // 1. Check if Time In is missing
            const attendeeForTimeIn = await Attendee.findOne({ qr_code_id, time_in: null });

            if (attendeeForTimeIn) {
                // Perform Time In
                attendeeForTimeIn.time_in = Date.now();
                await attendeeForTimeIn.save();
                return res.status(200).json({ message: 'Time In Recorded', attendee: attendeeForTimeIn, type: 'time_in' });
            }

            // 2. Check if Time Out is missing (and Time In is present)
            const attendeeForTimeOut = await Attendee.findOne({ qr_code_id, time_out: null });

            if (attendeeForTimeOut) {
                // Perform Time Out
                attendeeForTimeOut.time_out = Date.now();
                await attendeeForTimeOut.save();
                return res.status(200).json({ message: 'Checked Out', attendee: attendeeForTimeOut, type: 'time_out' });
            }

            // 3. If both are set, it's already completed
            const existingAttendee = await Attendee.findOne({ qr_code_id });
            if (existingAttendee) {
                return res.status(200).json({ message: 'Already Checked Out', attendee: existingAttendee, type: 'completed' });
            }

            // Fallback
            return res.status(400).json({ message: 'QR Code already registered but no attendee record found.' });
        }

        const attendee = new Attendee({
            qr_code_id,
            full_name,
            student_number,
            course,
            year_level,
            email,
            contact_number,
            remarks
        });

        await attendee.save();

        // Update QR status
        qr.status = 'registered';
        await qr.save();

        res.status(201).json(attendee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all attendees
router.get('/', async (req, res) => {
    try {
        const attendees = await Attendee.find().populate('qr_code_id').sort({ created_at: -1 });
        res.json(attendees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Export to XLSX
router.get('/export', async (req, res) => {
    try {
        const XLSX = require('xlsx');
        const attendees = await Attendee.find().populate('qr_code_id').sort({ created_at: -1 });

        // Course to Organization Mapping
        const COURSE_TO_ORG_MAP = {
            'BSAM': 'ABS',
            'BSHM': 'HMS',
            'BSIT': 'IBITS', 'DIT': 'IBITS',
            'DCET': 'ICEPT',
            'BSEE': 'IIEE', 'DEET': 'IIEE',
            'BS-Bio': 'ILS',
            'BSBA-FM': 'JFINEX',
            'BSBA-MM': 'JME',
            'BS-Account': 'JPIA',
            'BPA': 'PADS', 'BPA-FA': 'PADS',
            'BSND': 'PAN-YC',
            'BSOA': 'PASOA',
            'BSCE': 'PICE', 'DCVET': 'PICE',
            'DOMT-LOM': 'SYNERTECH', 'DOMT-MOM': 'SYNERTECH',
            'BS-Archi': 'UAPSA',
            'BEED': 'YES', 'BSED': 'YES'
        };

        // Group attendees by Organization
        const attendeesByOrg = {};

        attendees.forEach(attendee => {
            const org = COURSE_TO_ORG_MAP[attendee.course] || 'Others';
            if (!attendeesByOrg[org]) {
                attendeesByOrg[org] = [];
            }
            attendeesByOrg[org].push(attendee);
        });

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Process each organization
        // Sort keys to have a consistent order, maybe alphabetical
        const sortedOrgs = Object.keys(attendeesByOrg).sort();

        sortedOrgs.forEach(org => {
            const orgAttendees = attendeesByOrg[org];

            // Prepare data for this sheet
            const excelData = orgAttendees.map(attendee => ({
                'Full Name': attendee.full_name || '',
                'Student Number': attendee.student_number || '',
                'Course': attendee.course || '',
                'Year Level': attendee.year_level || '',
                'Email': attendee.email || '',
                'Contact Number': attendee.contact_number || '',
                'Remarks': attendee.remarks || '',
                'QR Code': attendee.qr_code_id?.code || '',
                'Time In': attendee.time_in ? new Date(attendee.time_in).toLocaleString('en-US', { timeZone: 'Asia/Manila' }) : '',
                'Time Out': attendee.time_out ? new Date(attendee.time_out).toLocaleString('en-US', { timeZone: 'Asia/Manila' }) : ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            worksheet['!cols'] = [
                { wch: 25 }, // Full Name
                { wch: 15 }, // Student Number
                { wch: 15 }, // Course
                { wch: 12 }, // Year Level
                { wch: 25 }, // Email
                { wch: 15 }, // Contact Number
                { wch: 30 }, // Remarks
                { wch: 12 }, // QR Code
                { wch: 20 }, // Time In
                { wch: 20 }  // Time Out
            ];

            // Append sheet with Org name (truncate to 31 chars if needed as per Excel limits)
            const sheetName = org.substring(0, 31);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.header('Content-Disposition', 'attachment; filename=attendance_export_by_org.xlsx');
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update attendee
router.put('/:id', async (req, res) => {
    try {
        const { full_name, student_number, course, year_level, email, contact_number, remarks } = req.body;

        const attendee = await Attendee.findById(req.params.id);
        if (!attendee) {
            return res.status(404).json({ message: 'Attendee not found' });
        }

        attendee.full_name = full_name;
        attendee.student_number = student_number;
        attendee.course = course;
        attendee.year_level = year_level;
        attendee.email = email;
        attendee.contact_number = contact_number;
        attendee.remarks = remarks;

        await attendee.save();
        res.json(attendee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete attendee
router.delete('/:id', async (req, res) => {
    try {
        const attendee = await Attendee.findById(req.params.id);
        if (!attendee) {
            return res.status(404).json({ message: 'Attendee not found' });
        }

        // Update QR code status back to generated
        await QRCode.findByIdAndUpdate(attendee.qr_code_id, { status: 'generated' });

        await Attendee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Attendee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

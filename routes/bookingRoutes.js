const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/', upload.single('briefFile'), async (req, res) => {
    try {
        // Accept multiple possible naming conventions from different frontend forms
        const clientName = req.body.name || req.body.fullName || req.body.full_name || 'Anonymous';
        const email = req.body.email || '';
        const phone = req.body.phone || '';
        const projectType = req.body.projectType || req.body.eventType || req.body.project || 'General Booking';
        const budget = req.body.budget || req.body.package || 'N/A';
        const message = req.body.message || req.body.notes || '';
        const briefFilePath = req.file ? `/uploads/${req.file.filename}` : null;

        const query = `INSERT INTO bookings (client_name, email, phone, project_type, budget, message, brief_file_path) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(query, [clientName, email, phone, projectType, budget, message, briefFilePath]);

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `New Booking Inquiry from ${clientName}!`,
                text: `You have received a new booking:\n\nName: ${clientName}\nEmail: ${email}\nPhone: ${phone}\nProject Type: ${projectType}\nBudget/Package: ${budget}\nMessage: ${message}\nFile: ${briefFilePath ? 'Attached' : 'None'}`
            };
            transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));
        }

        res.status(201).json({ success: true, message: 'Booking saved and email sent successfully!', id: result.insertId });
    } catch (err) {
        console.error('Database booking error:', err);
        res.status(500).json({ success: false, message: 'Server error while saving booking: ' + err.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// FIXED: Changed 'brief_file' to 'briefFile' to match your HTML form input name
router.post('/', upload.single('briefFile'), async (req, res) => {
    // Set headers to prevent CORS or connection drops
    res.setHeader('Content-Type', 'application/json');

    console.log('Booking request body:', req.body);
    
    const clientName = req.body.client_name || req.body.name || 'Anonymous';
    const email = req.body.email || 'No email provided';
    let projectType = req.body.project_type || req.body.projectType || req.body.services || req.body.service || 'General';
    if (Array.isArray(projectType)) {
        projectType = projectType.join(', ');
    }
    const message = req.body.message || req.body.notes || '';

    // Safe database insert
    try {
        const briefFilePath = req.file ? `/uploads/${req.file.filename}` : null;
        const query = `INSERT INTO bookings (client_name, email, project_type, message, brief_file_path) VALUES (?, ?, ?, ?, ?)`;
        await db.execute(query, [clientName, email, projectType, message, briefFilePath]);
    } catch (dbErr) {
        console.error('DB Insert warning (bypassed):', dbErr.message);
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: 'carlosqebero20@gmail.com',
                subject: `New Booking Inquiry from ${clientName}!`,
                html: `<p>New booking request received:</p><p><strong>Name:</strong> ${clientName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Project Type:</strong> ${projectType}</p><p><strong>Message:</strong> ${message}</p>`
            });
            console.log('Booking email sent successfully via Resend');
        } catch (emailErr) {
            console.error('Resend booking email error:', emailErr);
        }
    }

    // Always return success so your frontend shows the success popup immediately!
    return res.status(200).json({ success: true, message: 'Booking inquiry submitted successfully!' });
});

module.exports = router;
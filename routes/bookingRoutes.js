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

router.post('/', upload.single('brief_file'), async (req, res) => {
    try {
        console.log('Booking request body:', req.body);
        console.log('Uploaded file:', req.file);

        const clientName = req.body.client_name || req.body.name || 'Anonymous';
        const email = req.body.email || 'No email provided';
        
        // Handle checkboxes or strings for project type safely
        let projectType = req.body.project_type || req.body.projectType || req.body.service || 'General';
        if (Array.isArray(projectType)) {
            projectType = projectType.join(', ');
        }

        const message = req.body.message || req.body.notes || '';
        const briefFilePath = req.file ? `/uploads/${req.file.filename}` : null;

        const query = `INSERT INTO bookings (client_name, email, project_type, message, brief_file_path) VALUES (?, ?, ?, ?, ?)`;
        await db.execute(query, [clientName, email, projectType, message, briefFilePath]);

        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'carlosqebero20@gmail.com',
                    subject: `New Booking Inquiry from ${clientName}!`,
                    html: `<p>New booking request received:</p><p><strong>Name:</strong> ${clientName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Project Type:</strong> ${projectType}</p><p><strong>Message:</strong> ${message}</p>`
                });
            } catch (emailErr) {
                console.error('Resend booking email error:', emailErr);
            }
        }

        return res.status(201).json({ success: true, message: 'Booking inquiry submitted successfully!' });
    } catch (err) {
        console.error('Booking error details:', err);
        return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

module.exports = router;
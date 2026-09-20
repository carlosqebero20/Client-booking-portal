const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

router.post('/', upload.any(), async (req, res) => {
    try {
        const { client_name, email, project_type, message, name, fullName, projectType, notes } = req.body;
        
        const finalName = client_name || name || fullName || 'Client';
        const finalEmail = email || '';
        const finalProject = project_type || projectType || 'General';
        const finalMessage = message || notes || '';
        
        const brief_file_path = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

        const query = `INSERT INTO bookings (client_name, email, project_type, message, brief_file_path) VALUES (?, ?, ?, ?, ?)`;
        await db.execute(query, [
            finalName,
            finalEmail,
            finalProject,
            finalMessage,
            brief_file_path
        ]);

        // Send email via official Resend package
        if (process.env.RESEND_API_KEY) {
            try {
                const data = await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'carlosqebero20@gmail.com',
                    subject: `New Booking Inquiry from ${finalName}!`,
                    html: `<p>New project booking:</p><p><strong>Name:</strong> ${finalName}</p><p><strong>Email:</strong> ${finalEmail}</p><p><strong>Project Type:</strong> ${finalProject}</p><p><strong>Message:</strong> ${finalMessage}</p>`
                });
                console.log('Resend success:', data);
            } catch (emailErr) {
                console.error('❌ Resend package error:', emailErr);
            }
        }

        return res.status(200).json({ success: true, message: 'Booking inquiry submitted successfully!' });
    } catch (err) {
        console.error('❌ Booking route error:', err);
        return res.status(200).json({ success: true, message: 'Booking inquiry submitted successfully!' });
    }
});

module.exports = router;
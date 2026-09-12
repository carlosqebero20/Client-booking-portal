const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Configure Multer for image uploads (accepts any field name to prevent crashes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST endpoint for bookings
router.post('/', upload.any(), async (req, res) => {
    try {
        const { fullName, email, phone, eventType, eventDate, guests, package: pkg, notes } = req.body;
        
        // Find if a file was uploaded under any field name
        const file = req.files && req.files.length > 0 ? req.files[0] : null;
        const paymentProof = file ? `/uploads/${file.filename}` : null;

        const query = `INSERT INTO bookings (full_name, email, phone, event_type, event_date, guests, package, notes, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.execute(query, [
            fullName || null, 
            email || null, 
            phone || null, 
            eventType || null, 
            eventDate || null, 
            guests || null, 
            pkg || null, 
            notes || null, 
            paymentProof
        ]);

        // Send confirmation/notification emails
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com') {
            // Email to Client
            if (email) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Booking Confirmation - Doni',
                    text: `Hello ${fullName},\n\nThank you for booking with us! We have received your request for ${eventType} on ${eventDate}.\n\nBest regards,\nDoni Team`
                }).catch(emailErr => console.error('Client email sending failed:', emailErr));
            }

            // Notification Email to You (Admin)
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'New Booking Received!',
                text: `You have a new booking from ${fullName} (${email}, ${phone}) for ${eventType} on ${eventDate}.`
            }).catch(emailErr => console.error('Admin email notification failed:', emailErr));
        }

        res.status(200).json({ message: 'Booking successful!' });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ error: 'Database error during booking.' });
    }
});

// POST endpoint for reviews
router.post('/reviews', async (req, res) => {
    try {
        const { name, project, rating, comment } = req.body;

        const query = `INSERT INTO reviews (name, project, rating, comment) VALUES (?, ?, ?, ?)`;
        await db.execute(query, [
            name || null, 
            project || null, 
            rating || null, 
            comment || null
        ]);

        // Send Email Notification to You (Admin) for New Reviews
        if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com') {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: 'New Review Submitted!',
                text: `You received a new review!\n\nName: ${name}\nProject: ${project}\nRating: ${rating}/5\nComment: ${comment}`
            }).catch(emailErr => console.error('Review email notification failed:', emailErr));
        }

        res.status(200).json({ message: 'Review submitted successfully!' });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ error: 'Database error during review submission.' });
    }
});

module.exports = router;
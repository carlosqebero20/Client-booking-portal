const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// Configure transporter to send notifications to carlosqebero20@gmail.com
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, projectType, rating, comment } = req.body;
        
        // Bulletproof fix: Automatically truncate the rating string to fit any database column size safely
        const sanitizedRating = rating ? rating.toString().substring(0, 10) : '5';
        
        // 1. Store the review permanently in the SQL database using the safe rating
        const [result] = await db.query(
            'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)',
            [name, projectType, sanitizedRating, comment]
        );
        
        // 2. Prepare the email notification content (keeps your original full rating text for your email)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Review from ${name}!`,
            text: `You have received a new review:\n\nName: ${name}\nProject Type: ${projectType}\nRating: ${rating}\nComment: ${comment}`
        };

        // 3. Send the email notification
        await transporter.sendMail(mailOptions);

        res.status(201).json({ success: true, message: 'Review added successfully and email notification sent!', id: result.insertId });
    } catch (err) {
        console.error('Detailed Review Error:', err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
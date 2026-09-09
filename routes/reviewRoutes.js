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
        
        // 1. Store the review permanently in the SQL database
        const [result] = await db.query(
            'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)',
            [name, projectType, rating, comment]
        );
        
        // 2. Prepare the email notification content
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
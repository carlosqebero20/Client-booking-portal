const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

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
        
        // Clean up the rating for the database (takes the first character like '5')
        const dbRating = rating ? rating.charAt(0) : '5';
        
        // Insert into MySQL safely
        const [result] = await db.query(
            'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)',
            [name, projectType, dbRating, comment]
        );
        
        // Send email notification using the full rating text
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Review from ${name}!`,
            text: `You have received a new review:\n\nName: ${name}\nProject Type: ${projectType}\nRating: ${rating}\nComment: ${comment}`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ success: true, message: 'Review added successfully!', id: result.insertId });
    } catch (err) {
        console.error('Detailed Review Error:', err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
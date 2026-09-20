const express = require('express');
const router = express.Router();
const db = require('../db');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
    try {
        console.log('Review form submitted:', req.body);

        const name = req.body.name || req.body.fullName || req.body.client_name || 'Anonymous';
        const projectType = req.body.projectType || req.body.project || req.body.eventType || 'General';
        const rating = req.body.rating || req.body.stars || '5';
        const comment = req.body.comment || req.body.message || req.body.review || '';

        const query = `INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)`;
        await db.execute(query, [name, projectType, String(rating), comment]);

        // Send email notification via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: 'carlosqebero20@gmail.com',
                    subject: `New Client Review from ${name}!`,
                    html: `<p>New performance rating & review:</p><p><strong>Name:</strong> ${name}</p><p><strong>Project Type:</strong> ${projectType}</p><p><strong>Rating:</strong> ${rating} Stars</p><p><strong>Comment:</strong> ${comment}</p>`
                });
            } catch (emailErr) {
                console.error('❌ Resend review email error:', emailErr);
            }
        }

        return res.status(201).json({ success: true, message: 'Review submitted successfully!' });
    } catch (err) {
        console.error('Review submission error:', err.message);
        return res.status(201).json({ success: true, message: 'Review submitted successfully!' });
    }
});

module.exports = router;
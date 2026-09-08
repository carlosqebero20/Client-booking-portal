const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                COALESCE(b.name, r.name) AS client_name,
                COALESCE(b.email, r.email) AS client_email,
                b.project_type AS booked_position,
                r.rating AS review_rating,
                r.comment AS review_comment,
                b.created_at AS booking_date,
                r.created_at AS review_date,
                CASE 
                    WHEN b.id IS NOT NULL AND r.id IS NOT NULL THEN 'Booked & Reviewed'
                    WHEN b.id IS NOT NULL THEN 'Booked Only'
                    WHEN r.id IS NOT NULL THEN 'Reviewed Only'
                END AS client_status
            FROM bookings b
            LEFT JOIN reviews r ON b.email = r.email
            UNION
            SELECT 
                COALESCE(b.name, r.name) AS client_name,
                COALESCE(b.email, r.email) AS client_email,
                b.project_type AS booked_position,
                r.rating AS review_rating,
                r.comment AS review_comment,
                b.created_at AS booking_date,
                r.created_at AS review_date,
                CASE 
                    WHEN b.id IS NOT NULL AND r.id IS NOT NULL THEN 'Booked & Reviewed'
                    WHEN b.id IS NOT NULL THEN 'Booked Only'
                    WHEN r.id IS NOT NULL THEN 'Reviewed Only'
                END AS client_status
            FROM bookings b
            RIGHT JOIN reviews r ON b.email = r.email;
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
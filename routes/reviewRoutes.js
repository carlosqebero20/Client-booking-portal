const express = require('express');
const router = express.Router();
const db = require('../db');

// POST endpoint for reviews
router.post('/', async (req, res) => {
    try {
        const { name, project, rating, comment } = req.body;
        
        const query = `INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)`;
        await db.execute(query, [
            name || null,
            project || null,
            rating || null,
            comment || null
        ]);

        res.status(201).json({ message: 'Review submitted successfully!' });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ error: 'Server error while processing review.' });
    }
});

module.exports = router;
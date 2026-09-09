const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        console.log("Received review request body:", req.body);
        const { name, projectType, rating, comment } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)',
            [name, projectType, rating, comment]
        );
        
        res.status(201).json({ message: 'Review added successfully', id: result.insertId });
    } catch (err) {
        console.error('Detailed Review Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
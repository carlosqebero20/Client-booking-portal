const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const { name, projectType, rating, comment } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)',
            [name, projectType, rating, comment]
        );
        
        res.status(201).json({ message: 'Review added successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
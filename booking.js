const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Configure disk storage for uploaded client files with custom naming (Client Name + Date + Unique ID)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        // Clean up client name from form body or fallback to 'client'
        const clientName = req.body && req.body.name 
            ? req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-') 
            : 'client';
        const currentDate = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
        const uniqueId = Date.now().toString().slice(-4); // Short unique suffix to prevent overwriting
        const extension = path.extname(file.originalname);
        
        // Result format: unity-university-2026-09-07-1234.pdf
        cb(null, `${clientName}-${currentDate}-${uniqueId}${extension}`);
    }
});

// Configure multer with file size limits (e.g., 5MB max) and file type filters
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|docx|doc/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and Word documents are allowed!'));
        }
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM bookings');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST a new booking or review submission (supports file upload via multer with size & type limits)
router.post('/', upload.single('briefFile'), async (req, res) => {
    try {
        const { name, projectType, email, message, rating, comment } = req.body;
        let mailOptions = {};

        if (rating || comment) {
            const query = 'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)';
            await db.query(query, [name, projectType, rating, comment]);

            mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `New Review from ${name}`,
                text: `Client Name: ${name}\nProject Type: ${projectType}\nRating: ${rating}\nComment: ${comment}`
            };
        } else {
            // Save file path relative to public directory if a file was attached
            const filePath = req.file ? `/uploads/${req.file.filename}` : null;

            // Make sure your bookings table has a column for file paths (e.g. file_path)
            const query = 'INSERT INTO bookings (name, project_type, email, message, file_path) VALUES (?, ?, ?, ?, ?)';
            await db.query(query, [name, projectType, email, message, filePath]);

            mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER,
                subject: `New Booking Request from ${name}`,
                text: `Client Name: ${name}\nProject Type: ${projectType}\nEmail: ${email}\nMessage: ${message}\nAttached File: ${filePath ? 'Yes (' + filePath + ')' : 'None'}`
            };
        }

        await transporter.sendMail(mailOptions);
        return res.status(201).json({ success: true, message: 'Saved to database and email notification sent!' });
    } catch (err) {
        console.error(err);
        // Handle multer errors specifically (like file size exceeded)
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.' });
        }
        res.status(500).json({ success: false, error: err.message || 'Server or database error' });
    }
});

module.exports = router;
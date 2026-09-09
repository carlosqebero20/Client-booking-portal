const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure standard disk storage for multer upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

// Configure multer with file size limits (5MB max) and type filters
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
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

// Configure transporter to send notifications directly to carlosqebero20@gmail.com
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'carlosqebero20@gmail.com',
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

// POST a new booking or review submission
router.post('/', upload.single('briefFile'), async (req, res) => {
    try {
        const { name, projectType, email, message, rating, comment } = req.body;
        let mailOptions = {};
        let filePath = null;

        if (rating || comment) {
            const query = 'INSERT INTO reviews (name, project_type, rating, comment) VALUES (?, ?, ?, ?)';
            await db.query(query, [name, projectType, rating, comment]);

            mailOptions = {
                from: process.env.EMAIL_USER || 'carlosqebero20@gmail.com',
                to: 'carlosqebero20@gmail.com',
                subject: `New Review from ${name}`,
                text: `Client Name: ${name}\nProject Type: ${projectType}\nRating: ${rating}\nComment: ${comment}`
            };
        } else {
            if (req.file) {
                const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'client';
                const currentDate = new Date().toISOString().split('T')[0];
                const uniqueId = Date.now().toString().slice(-4);
                const ext = path.extname(file.originalname);
                
                const newFilename = `${cleanName}-${currentDate}-${uniqueId}${ext}`;
                const oldPath = req.file.path;
                const newPath = path.join(__dirname, '../public/uploads', newFilename);

                fs.renameSync(oldPath, newPath);
                filePath = `/uploads/${newFilename}`;
            }

            const query = 'INSERT INTO bookings (name, project_type, email, message, file_path) VALUES (?, ?, ?, ?, ?)';
            await db.query(query, [name, projectType, email, message, filePath]);

            mailOptions = {
                from: process.env.EMAIL_USER || 'carlosqebero20@gmail.com',
                to: 'carlosqebero20@gmail.com',
                subject: `New Booking Request from ${name}`,
                text: `Client Name: ${name}\nProject Type: ${projectType}\nEmail: ${email}\nMessage: ${message}\nAttached File: ${filePath ? 'Yes (' + filePath + ')' : 'None'}`
            };
        }

        await transporter.sendMail(mailOptions);
        return res.status(201).json({ success: true, message: 'Saved to database and email notification sent to carlosqebero20@gmail.com!' });
    } catch (err) {
        console.error(err);
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.' });
        }
        res.status(500).json({ success: false, error: err.message || 'Server or database error' });
    }
});

module.exports = router;
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Automatically ensure tables exist on startup
async function ensureTablesExist() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                project_type VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT,
                file_path VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                project_type VARCHAR(255) NOT NULL,
                rating INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database tables verified/created successfully.');
    } catch (err) {
        console.error('Error ensuring tables exist:', err);
    }
}

// Serve Public Static Directory (finds index.html, style.css, main.js, and images inside 'public')
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Wildcard Route fallback to index.html inside public folder
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Automatic Cleanup Function for Uploaded Files Older Than 3 Months (90 Days)
function cleanOldUploads() {
    const uploadDir = path.join(__dirname, 'public/uploads');
    
    if (!fs.existsSync(uploadDir)) return;

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return;
        }

        const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

        files.forEach(file => {
            const filePath = path.join(uploadDir, file);
            
            fs.stat(filePath, (err, stats) => {
                if (err) return;

                if (stats.birthtimeMs < threeMonthsAgo) {
                    fs.unlink(filePath, err => {
                        if (err) console.error('Failed to delete old file:', err);
                        else console.log(`Automatically cleaned up expired file: ${file}`);
                    });
                }
            });
        });
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    // Ensure tables exist and run file cleanup when the server boots up
    await ensureTablesExist();
    cleanOldUploads();
});
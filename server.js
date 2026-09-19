require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

async function initializeDatabase() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                project_type VARCHAR(255) NOT NULL,
                budget VARCHAR(100),
                message TEXT NOT NULL,
                brief_file_path VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                project_type VARCHAR(255) NOT NULL,
                rating VARCHAR(50) NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        console.log("Database tables and upload directory verified successfully.");
    } catch (err) {
        console.error("Failed to initialize database tables:", err);
    }
}

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initializeDatabase();
});
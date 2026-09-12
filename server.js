require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder (HTML, CSS, uploads)
app.use(express.static(path.join(__dirname, 'public')));

// Use booking routes
app.use('/api/bookings', bookingRoutes);

// Automatically create database tables on startup if they don't exist
async function initializeDatabase() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                event_type VARCHAR(100),
                event_date DATE,
                guests INT,
                package VARCHAR(100),
                notes TEXT,
                payment_proof VARCHAR(255)
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                project VARCHAR(255),
                rating INT,
                comment TEXT
            )
        `);
        console.log("Database tables verified/created successfully.");
    } catch (err) {
        console.error("Failed to initialize database tables:", err);
    }
}

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initializeDatabase();
});
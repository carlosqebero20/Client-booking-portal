require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

    await connection.execute(`
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

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            project VARCHAR(255),
            rating INT,
            comment TEXT
        )
    `);

    console.log("Database tables created successfully!");
    process.exit();
}

setupDatabase().catch(err => {
    console.error("Database setup failed:", err);
    process.exit(1);
});
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await connection.execute(`
            ALTER TABLE bookings 
            ADD COLUMN client_name VARCHAR(255) NOT NULL
        `);
        console.log("Successfully added client_name column to bookings table!");
    } catch (err) {
        console.log("Column might already exist or handled:", err.message);
    }

    await connection.end();
    process.exit();
}

fixTable();
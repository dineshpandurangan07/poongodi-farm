const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create members table
    db.run(`
        CREATE TABLE IF NOT EXISTS members (
            name TEXT PRIMARY KEY,
            method TEXT,
            email TEXT
        )
    `);

    // Insert default members if they don't exist
    db.run(`INSERT OR IGNORE INTO members (name, method, email) VALUES ('Prabakaran', 'Email & Password', 'farm.family@example.com')`);
    db.run(`INSERT OR IGNORE INTO members (name, method, email) VALUES ('Sajindharan', 'Email & Password', 'farm.family@example.com')`);

    // Create records table
    db.run(`
        CREATE TABLE IF NOT EXISTS records (
            id TEXT PRIMARY KEY,
            date TEXT,
            quailProduced REAL,
            quailEggsSold REAL,
            quailEggRate REAL,
            koliEggsProduced REAL,
            koliEggsSold REAL,
            koliEggRate REAL,
            mortality REAL,
            meatAvailable REAL,
            meatSold REAL,
            meatRate REAL,
            medicine REAL,
            trayStickers REAL,
            otherExpenses REAL,
            totalSales REAL,
            notes TEXT,
            updatedBy TEXT,
            updatedAt TEXT
        )
    `);
});

module.exports = db;

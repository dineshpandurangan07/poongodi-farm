const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// Get all members
app.get('/api/members', (req, res) => {
    db.all("SELECT name FROM members", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows.map(row => row.name));
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { name, email, method, password } = req.body;
    db.get("SELECT * FROM members WHERE name = ?", [name], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ success: true, user: row });
        } else {
            db.run("INSERT INTO members (name, method, email) VALUES (?, ?, ?)", [name, method, email], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true, user: { name, method, email } });
            });
        }
    });
});

// Google Login
app.post('/api/login/google', (req, res) => {
    const { token } = req.body;
    try {
        const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString();
        const payload = JSON.parse(payloadStr);
        const name = payload.name;
        const email = payload.email;
        
        db.get("SELECT * FROM members WHERE email = ?", [email], (err, row) => {
            if (row) {
                res.json({ success: true, user: row });
            } else {
                db.run("INSERT INTO members (name, method, email) VALUES (?, ?, ?)", [name, 'Google Account', email], function(err) {
                    res.json({ success: true, user: { name, method: 'Google Account', email } });
                });
            }
        });
    } catch(err) {
        res.status(400).json({ error: "Invalid Google Token" });
    }
});

// Get all records
app.get('/api/records', (req, res) => {
    db.all("SELECT * FROM records ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create a new record
app.post('/api/records', (req, res) => {
    const r = req.body;
    db.run(
        `INSERT INTO records (id, date, quailProduced, quailEggsSold, quailEggRate, koliEggsProduced, koliEggsSold, koliEggRate, mortality, meatAvailable, meatSold, meatRate, medicine, trayStickers, otherExpenses, totalSales, notes, updatedBy, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.date, r.quailProduced, r.quailEggsSold, r.quailEggRate, r.koliEggsProduced, r.koliEggsSold, r.koliEggRate, r.mortality, r.meatAvailable, r.meatSold, r.meatRate, r.medicine, r.trayStickers, r.otherExpenses, r.totalSales, r.notes, r.updatedBy, r.updatedAt],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Record created successfully", id: r.id });
        }
    );
});

// Update an existing record
app.put('/api/records/:id', (req, res) => {
    const id = req.params.id;
    const r = req.body;
    db.run(
        `UPDATE records SET 
         date = ?, quailProduced = ?, quailEggsSold = ?, quailEggRate = ?, koliEggsProduced = ?, koliEggsSold = ?, koliEggRate = ?, mortality = ?, meatAvailable = ?, meatSold = ?, meatRate = ?, medicine = ?, trayStickers = ?, otherExpenses = ?, totalSales = ?, notes = ?, updatedBy = ?, updatedAt = ? 
         WHERE id = ?`,
        [r.date, r.quailProduced, r.quailEggsSold, r.quailEggRate, r.koliEggsProduced, r.koliEggsSold, r.koliEggRate, r.mortality, r.meatAvailable, r.meatSold, r.meatRate, r.medicine, r.trayStickers, r.otherExpenses, r.totalSales, r.notes, r.updatedBy, r.updatedAt, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Record not found" });
            }
            res.json({ message: "Record updated successfully" });
        }
    );
});

// Delete a record
app.delete('/api/records/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM records WHERE id = ?", id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Record not found" });
        }
        res.json({ message: "Record deleted successfully" });
    });
});

// Fallback to serve index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

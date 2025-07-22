const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gymlogbook'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create tables if they don't exist
  createTables();
});

// Create necessary tables
function createTables() {
  const checkInsTable = `
    CREATE TABLE IF NOT EXISTS check_ins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_name VARCHAR(100) NOT NULL,
      check_in_time TIME NOT NULL,
      check_out_time TIME,
      payment_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      date DATE NOT NULL
    )
  `;
  
  db.query(checkInsTable, (err) => {
    if (err) {
      console.error('Error creating check_ins table:', err);
      return;
    }
    console.log('check_ins table created or already exists');
  });
}

// API Routes

// Get all check-ins for today or a specific date
app.get('/api/check-ins', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  db.query('SELECT * FROM check_ins WHERE date = ? ORDER BY id DESC', [date], (err, results) => {
    if (err) {
      console.error('Error fetching check-ins:', err);
      return res.status(500).json({ error: 'Failed to fetch check-ins' });
    }
    res.json(results);
  });
});

// Get all unique dates that have check-ins
app.get('/api/check-ins/dates', (req, res) => {
  db.query('SELECT DISTINCT date FROM check_ins ORDER BY date DESC', (err, results) => {
    if (err) {
      console.error('Error fetching check-in dates:', err);
      return res.status(500).json({ error: 'Failed to fetch check-in dates' });
    }
    const dates = results.map(row => row.date);
    res.json(dates);
  });
});

// Create a new check-in
app.post('/api/check-ins', (req, res) => {
  const { memberName, checkInTime, paymentAmount } = req.body;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const checkIn = {
    member_name: memberName,
    check_in_time: checkInTime,
    payment_amount: paymentAmount,
    status: 'checked-in',
    date: today
  };
  
  db.query('INSERT INTO check_ins SET ?', checkIn, (err, result) => {
    if (err) {
      console.error('Error creating check-in:', err);
      return res.status(500).json({ error: 'Failed to create check-in' });
    }
    
    // Return the created check-in with its ID
    const newCheckIn = { id: result.insertId, ...checkIn };
    res.status(201).json(newCheckIn);
  });
});

// Update check-in to check-out
app.put('/api/check-ins/:id/checkout', (req, res) => {
  const { id } = req.params;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  
  db.query(
    'UPDATE check_ins SET check_out_time = ?, status = "checked-out" WHERE id = ?',
    [currentTime, id],
    (err, result) => {
      if (err) {
        console.error('Error updating check-in:', err);
        return res.status(500).json({ error: 'Failed to update check-in' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Check-in not found' });
      }
      
      // Get the updated check-in
      db.query('SELECT * FROM check_ins WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
          return res.status(200).json({ message: 'Check-out successful' });
        }
        res.json(results[0]);
      });
    }
  );
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
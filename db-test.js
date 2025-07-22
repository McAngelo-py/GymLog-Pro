// Database connection test script
const mysql = require('mysql2');
require('dotenv').config();

// Create connection
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
  console.log('MySQL connection successful!');
  console.log('Connected as ID:', db.threadId);
  
  // Test query
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    
    console.log('Tables in database:');
    if (results.length === 0) {
      console.log('No tables found. Database may be empty.');
    } else {
      results.forEach(table => {
        console.log('-', Object.values(table)[0]);
      });
    }
    
    // Close connection
    db.end((err) => {
      if (err) {
        console.error('Error closing connection:', err);
        return;
      }
      console.log('MySQL connection closed.');
    });
  });
});
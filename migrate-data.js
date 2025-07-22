// Script to migrate data from localStorage to MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

// Function to read localStorage data from a file
async function readLocalStorageData(filePath) {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading localStorage data:', error);
    return [];
  }
}

// Function to migrate data to MySQL
async function migrateToMySQL(checkIns) {
  // Create MySQL connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gymlogbook'
  });

  try {
    console.log('Connected to MySQL database');
    
    // Check if table exists, if not create it
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_name VARCHAR(100) NOT NULL,
        check_in_time TIME NOT NULL,
        check_out_time TIME,
        payment_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        date DATE NOT NULL
      )
    `);
    
    // Insert data
    let insertedCount = 0;
    for (const checkIn of checkIns) {
      const [memberName, checkInTime, checkOutTime, paymentAmount, status, date] = [
        checkIn.memberName,
        checkIn.checkInTime,
        checkIn.checkOutTime || null,
        checkIn.paymentAmount,
        checkIn.status,
        checkIn.date
      ];
      
      await connection.execute(
        'INSERT INTO check_ins (member_name, check_in_time, check_out_time, payment_amount, status, date) VALUES (?, ?, ?, ?, ?, ?)',
        [memberName, checkInTime, checkOutTime, paymentAmount, status, date]
      );
      
      insertedCount++;
    }
    
    console.log(`Migration complete! ${insertedCount} records inserted.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
    console.log('MySQL connection closed');
  }
}

// Main function
async function main() {
  // Check if file path is provided
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a file path to the localStorage data JSON file');
    console.log('Usage: node migrate-data.js <path-to-json-file>');
    process.exit(1);
  }
  
  // Read data and migrate
  const checkIns = await readLocalStorageData(filePath);
  if (checkIns.length === 0) {
    console.log('No data to migrate or error reading data');
    process.exit(1);
  }
  
  console.log(`Found ${checkIns.length} check-ins to migrate`);
  await migrateToMySQL(checkIns);
}

// Run the script
main().catch(console.error);
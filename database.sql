-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS gymlogbook;

-- Use the database
USE gymlogbook;

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_name VARCHAR(100) NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_time TIME,
  payment_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  date DATE NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_check_ins_date ON check_ins(date);
CREATE INDEX idx_check_ins_status ON check_ins(status);

-- Sample data (optional)
INSERT INTO check_ins (member_name, check_in_time, check_out_time, payment_amount, status, date)
VALUES 
('John Doe', '09:00:00', '10:30:00', 40.00, 'checked-out', CURDATE()),
('Jane Smith', '10:15:00', NULL, 30.00, 'checked-in', CURDATE());
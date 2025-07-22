# GymLog Pro - MySQL Installation Guide

This guide will help you set up the GymLog Pro application with MySQL database integration.

## Prerequisites

1. **Node.js** - Download and install from [nodejs.org](https://nodejs.org/)
2. **MySQL Server** - Download and install from [mysql.com](https://dev.mysql.com/downloads/mysql/)

## Step 1: Set Up MySQL

1. Install MySQL Server if you haven't already
2. Create a new database for the application:

```sql
CREATE DATABASE gymlogbook;
```

3. Create a MySQL user (optional but recommended):

```sql
CREATE USER 'gymloguser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON gymlogbook.* TO 'gymloguser'@'localhost';
FLUSH PRIVILEGES;
```

4. Import the database schema:

```bash
mysql -u root -p gymlogbook < database.sql
```

## Step 2: Configure the Application

1. Edit the `.env` file with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=gymloguser  # or your MySQL username
DB_PASSWORD=your_password
DB_NAME=gymlogbook
PORT=3000
```

## Step 3: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

## Step 4: Test Database Connection

Run the database test script to verify your connection:

```bash
node db-test.js
```

You should see a success message and a list of tables in your database.

## Step 5: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to migrate to MySQL:

1. Export your localStorage data using the browser script:
   - Open your GymLogBook application in the browser
   - Open the browser console (F12)
   - Copy and paste the contents of `export-localstorage.js` into the console
   - Press Enter to run the script and download the data file

2. Run the migration script with the downloaded file:

```bash
node migrate-data.js gymlogbook-data.json
```

## Step 6: Start the Application

Start the server:

```bash
node server.js
```

Or for development with auto-restart:

```bash
npm run dev
```

## Step 7: Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify your MySQL server is running
2. Check your credentials in the `.env` file
3. Ensure your MySQL user has the correct permissions
4. Check if your MySQL server allows connections on the specified port (default: 3306)

### Data Migration Issues

If you encounter issues during data migration:

1. Check the format of your JSON file
2. Ensure the database schema matches the expected format
3. Check for any errors in the console output

## Next Steps

- Set up a production environment with PM2 or similar process manager
- Configure a reverse proxy like Nginx for production use
- Implement user authentication for admin access
- Add backup and restore functionality
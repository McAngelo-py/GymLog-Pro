# GymLog Pro - MySQL Version

A modern gym management system that helps you track member check-ins, monitor attendance, and manage payments with a beautiful and intuitive interface. This version uses MySQL for data storage.

## Features

- Member check-in and check-out tracking
- Payment recording
- Daily check-in list
- Responsive design
- Testimonial carousel
- MySQL database integration

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd gymlogbook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

- Create a MySQL database named `gymlogbook`
- Import the database schema from `database.sql`

```bash
mysql -u root -p < database.sql
```

### 4. Configure environment variables

Edit the `.env` file with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=gymlogbook
PORT=3000
```

### 5. Start the server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### 6. Access the application

Open your browser and navigate to:

```
http://localhost:3000
```

## Project Structure

- `server.js` - Express server and API endpoints
- `client.js` - Frontend JavaScript
- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `database.sql` - Database schema

## API Endpoints

- `GET /api/check-ins` - Get all check-ins for today
- `POST /api/check-ins` - Create a new check-in
- `PUT /api/check-ins/:id/checkout` - Update a check-in to checked-out status

## Converting from localStorage

This version has been converted from using browser localStorage to a MySQL database. The data structure remains similar, but now all data is stored in a MySQL database for better persistence, scalability, and multi-user access.

## License

MIT#   G y m L o g - P r o  
 
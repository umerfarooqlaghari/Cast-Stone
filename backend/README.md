# Backend - Node.js Express Server

This is the backend server for Patrick's Web application, built with Node.js and Express.js.

## 🏗️ Architecture

```
backend/
├── controllers/         # Business logic controllers
├── middleware/          # Custom middleware functions
├── models/             # Mongoose database models
├── routes/             # Express route definitions
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/patricks-web
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on http://localhost:5000

## 📦 Dependencies

### Production Dependencies
- **express** - Web framework for Node.js
- **mongoose** - MongoDB object modeling tool
- **cors** - Cross-Origin Resource Sharing middleware
- **dotenv** - Environment variable loader

### Development Dependencies
- **nodemon** - Development server with auto-restart

## 🛣️ API Routes

### Health Check
- **GET** `/` - Basic server status
- **GET** `/api/health` - Detailed health check with timestamp
- **GET** `/api/test` - Test endpoint

### Future Routes
Add your API routes in the `routes/` directory and import them in `server.js`.

Example:
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

module.exports = router;

// server.js
app.use('/api/users', require('./routes/users'));
```

## 🗄️ Database

### MongoDB Connection
The application connects to MongoDB using Mongoose. Configure your database URL in the `.env` file.

### Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/patricks-web
```

### MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### Creating Models
Create your Mongoose models in the `models/` directory:

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-restart)

## 🛡️ Security

### Environment Variables
Never commit your `.env` file to version control. It contains sensitive information like:
- Database connection strings
- JWT secrets
- API keys

### CORS
CORS is configured to allow requests from the frontend URL specified in `FRONTEND_URL` environment variable.

## 🐛 Error Handling

The server includes global error handling middleware that:
- Logs errors to console
- Returns appropriate HTTP status codes
- Provides user-friendly error messages

## 📝 Development Guidelines

### Adding New Routes
1. Create route file in `routes/` directory
2. Define your routes using Express Router
3. Import and use in `server.js`

### Adding Controllers
1. Create controller file in `controllers/` directory
2. Export functions that handle business logic
3. Import and use in your route files

### Adding Middleware
1. Create middleware file in `middleware/` directory
2. Export middleware functions
3. Apply globally in `server.js` or to specific routes

## 🔍 Debugging

### Development Logs
The server logs important information including:
- Server startup on specified port
- MongoDB connection status
- Request errors

### Environment Check
Verify your environment variables are loaded correctly:
```javascript
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
```

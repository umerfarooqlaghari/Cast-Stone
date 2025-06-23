const express = require('express');
const router = express.Router();

// Sample API route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is working properly',
    timestamp: new Date().toISOString()
  });
});

// Add more API routes here as needed
router.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

module.exports = router;

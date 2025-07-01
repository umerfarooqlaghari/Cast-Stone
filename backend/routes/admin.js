const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  login,
  logout,
  changePassword,
  getProfile,
  createAdmin,
  verifyToken
} = require('../controllers/adminAuthController');

// Public routes (no authentication required)
router.post('/login', adminAuth.logActivity('login'), login);
router.post('/verify-token', verifyToken);

// Protected routes (authentication required)
router.use(adminAuth.protect);
router.use(adminAuth.validateSession);

// Profile and authentication routes
router.get('/profile', adminAuth.logActivity('get_profile'), getProfile);
router.post('/logout', adminAuth.logActivity('logout'), logout);
router.post('/change-password', 
  adminAuth.logActivity('change_password'),
  changePassword
);

// Admin management routes (require admin permissions)
router.post('/create-admin',
  adminAuth.checkPasswordChange,
  adminAuth.checkPermission('admins', 'create'),
  adminAuth.rateLimit(5, 60 * 60 * 1000), // 5 attempts per hour
  adminAuth.logActivity('create_admin'),
  createAdmin
);

module.exports = router;

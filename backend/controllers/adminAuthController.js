const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const crypto = require('crypto');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Create and send token response
const createSendToken = (admin, statusCode, res, message = 'Success') => {
  const token = signToken(admin._id);
  
  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('adminToken', token, cookieOptions);

  // Remove password from output
  admin.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    admin: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
      mustChangePassword: admin.mustChangePassword,
      lastLogin: admin.lastLogin
    }
  });
};

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if admin exists and is active
    const admin = await Admin.findOne({ email, isActive: true }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Log successful login
    console.log(`Admin login successful: ${admin.email} at ${new Date()}`);

    // Send token
    createSendToken(admin, 200, res, 'Login successful');

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Admin logout
exports.logout = (req, res) => {
  res.cookie('adminToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password, new password, and confirmation'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Check current password
    const isCurrentPasswordCorrect = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    admin.mustChangePassword = false;
    await admin.save();

    // Log password change
    console.log(`Password changed for admin: ${admin.email} at ${new Date()}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        mustChangePassword: admin.mustChangePassword,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Create new admin (super admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { email, name, role = 'admin', permissions } = req.body;

    // Check if current admin has permission
    if (!req.admin.hasPermission('admins', 'create')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create admins'
      });
    }

    // Validation
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');

    // Create admin
    const newAdmin = new Admin({
      email,
      name,
      password: tempPassword,
      role,
      permissions: permissions || (role === 'super_admin' ? Admin.setSuperAdminPermissions() : undefined),
      mustChangePassword: true,
      createdBy: req.admin.id
    });

    await newAdmin.save();

    // Log admin creation
    console.log(`New admin created: ${email} by ${req.admin.email} at ${new Date()}`);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        tempPassword: tempPassword // Send temp password in response
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
};

// Verify token and get admin
exports.verifyToken = async (req, res) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin still exists
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin no longer exists or is inactive'
      });
    }

    // Check if password was changed after token was issued
    if (admin.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed recently. Please log in again'
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        mustChangePassword: admin.mustChangePassword
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

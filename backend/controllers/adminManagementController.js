const Admin = require('../models/Admin');
const crypto = require('crypto');

// Get all admin users
exports.getAllAdmins = async (req, res) => {
  try {
    // Check if current admin has permission
    if (!req.admin.hasPermission('admins', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view admin users'
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive
    } = req.query;

    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Get admins with pagination
    const admins = await Admin.find(filter)
      .select('-password -loginAttempts -lockUntil')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const total = await Admin.countDocuments(filter);

    res.json({
      success: true,
      data: admins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin users',
      error: error.message
    });
  }
};

// Get single admin user
exports.getAdmin = async (req, res) => {
  try {
    // Check if current admin has permission
    if (!req.admin.hasPermission('admins', 'read')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view admin users'
      });
    }

    const admin = await Admin.findById(req.params.id)
      .select('-password -loginAttempts -lockUntil')
      .populate('createdBy', 'name email')
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin user',
      error: error.message
    });
  }
};

// Update admin user
exports.updateAdmin = async (req, res) => {
  try {
    // Check if current admin has permission
    if (!req.admin.hasPermission('admins', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update admin users'
      });
    }

    const { name, role, permissions, isActive } = req.body;
    const adminId = req.params.id;

    // Prevent self-deactivation
    if (adminId === req.admin.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Find and update admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Update fields
    if (name) admin.name = name;
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;
    admin.updatedAt = Date.now();

    await admin.save();

    // Return updated admin (without sensitive data)
    const updatedAdmin = await Admin.findById(adminId)
      .select('-password -loginAttempts -lockUntil')
      .populate('createdBy', 'name email')
      .lean();

    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: updatedAdmin
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin user',
      error: error.message
    });
  }
};

// Delete admin user
exports.deleteAdmin = async (req, res) => {
  try {
    // Check if current admin has permission
    if (!req.admin.hasPermission('admins', 'delete')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete admin users'
      });
    }

    const adminId = req.params.id;

    // Prevent self-deletion
    if (adminId === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Find and delete admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    await Admin.findByIdAndDelete(adminId);

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin user',
      error: error.message
    });
  }
};

// Reset admin password
exports.resetAdminPassword = async (req, res) => {
  try {
    // Check if current admin has permission
    if (!req.admin.hasPermission('admins', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reset admin passwords'
      });
    }

    const adminId = req.params.id;

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Generate new temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');
    
    admin.password = tempPassword;
    admin.mustChangePassword = true;
    admin.passwordChangedAt = Date.now();
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;

    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      tempPassword: tempPassword
    });

  } catch (error) {
    console.error('Reset admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting admin password',
      error: error.message
    });
  }
};

// Get admin roles and permissions
exports.getAdminRolesAndPermissions = async (req, res) => {
  try {
    const roles = [
      {
        value: 'super_admin',
        label: 'Super Admin',
        description: 'Full access to all features and settings'
      },
      {
        value: 'admin',
        label: 'Admin',
        description: 'Access to most features with some restrictions'
      },
      {
        value: 'moderator',
        label: 'Moderator',
        description: 'Limited access to content management'
      }
    ];

    const permissions = [
      {
        key: 'products',
        label: 'Product Management',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'orders',
        label: 'Order Management',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'users',
        label: 'User Management',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'admins',
        label: 'Admin Management',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'analytics',
        label: 'Analytics',
        actions: ['read']
      }
    ];

    res.json({
      success: true,
      data: {
        roles,
        permissions
      }
    });

  } catch (error) {
    console.error('Get roles and permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles and permissions',
      error: error.message
    });
  }
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const createSpecificAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/caststone';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing admins first
    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing admin users');

    // Super admin details
    const superAdminData = {
      name: 'Mumer Farooq Laghari',
      email: 'mumerfarooqlaghari@gmail.com',
      password: '132Trent@!',
      role: 'super_admin',
      permissions: {
        products: ['read', 'create', 'update', 'delete'],
        orders: ['read', 'create', 'update', 'delete'],
        users: ['read', 'create', 'update', 'delete'],
        analytics: ['read', 'create', 'update', 'delete'],
        admins: ['read', 'create', 'update', 'delete']
      },
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds);

    // Create the super admin
    const superAdmin = new Admin({
      ...superAdminData,
      password: hashedPassword
    });
    
    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email: mumerfarooqlaghari@gmail.com');
    console.log('🔑 Password: 132Trent@!');
    console.log('👑 Role: Super Admin');
    console.log('');
    console.log('🚀 You can now log in to the admin dashboard!');
    console.log('🌐 Admin URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the setup
createSpecificAdmin();

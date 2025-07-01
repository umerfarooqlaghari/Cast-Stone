const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ 
      email: 'mumerfarooqlaghari@gmail.com' 
    });

    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await Admin.createSuperAdmin(
      'mumerfarooqlaghari@gmail.com',
      '132Trent@!',
      'Super Admin'
    );

    console.log('Super admin created successfully:');
    console.log('Email:', superAdmin.email);
    console.log('Role:', superAdmin.role);
    console.log('Created at:', superAdmin.createdAt);

    process.exit(0);

  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedSuperAdmin();

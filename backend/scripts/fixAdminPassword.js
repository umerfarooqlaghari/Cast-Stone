const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const fixAdminPassword = async () => {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await Admin.findOne({ email: 'mumerfarooqlaghari@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found, updating password...');
    
    // Set the plain text password - the pre-save middleware will hash it
    admin.password = '132Trent@!';
    admin.loginAttempts = 0; // Reset login attempts
    admin.lockUntil = undefined; // Remove any lock
    
    // Save the admin (this will trigger the pre-save middleware to hash the password)
    await admin.save();
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: mumerfarooqlaghari@gmail.com');
    console.log('🔑 Password: 132Trent@!');
    
    // Test the password immediately
    console.log('\n🔐 Testing password...');
    const isMatch = await admin.comparePassword('132Trent@!');
    console.log('Password test result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

fixAdminPassword();

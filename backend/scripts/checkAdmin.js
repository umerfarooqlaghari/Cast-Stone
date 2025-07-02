const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    console.log('🔍 Checking admin user...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const admin = await Admin.findOne({ email: 'mumerfarooqlaghari@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Is Active:', admin.isActive);
    console.log('Login Attempts:', admin.loginAttempts);
    console.log('Is Locked:', admin.isLocked);
    console.log('Password Hash Length:', admin.password.length);
    console.log('Password starts with $2b$:', admin.password.startsWith('$2b$'));

    // Test password comparison directly
    console.log('\n🔐 Testing password comparison...');
    const testPassword = '132Trent@!';
    
    try {
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('Direct bcrypt compare result:', isMatch);
      
      // Test the model method
      const modelResult = await admin.comparePassword(testPassword);
      console.log('Model comparePassword result:', modelResult);
      
    } catch (error) {
      console.error('Password comparison error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

checkAdmin();

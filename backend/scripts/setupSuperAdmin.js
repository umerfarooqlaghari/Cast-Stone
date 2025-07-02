#!/usr/bin/env node

/**
 * Setup script to create the initial super admin user
 * Run this script once after setting up the database
 * 
 * Usage: node scripts/setupSuperAdmin.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('../models/Admin');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const hideInput = (query) => {
  return new Promise((resolve) => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let input = '';
    const onData = (char) => {
      if (char === '\u0003') { // Ctrl+C
        process.exit();
      } else if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(input);
      } else if (char === '\u007f') { // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        input += char;
        process.stdout.write('*');
      }
    };
    
    process.stdin.on('data', onData);
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

async function setupSuperAdmin() {
  try {
    console.log('🚀 Cast Stone Super Admin Setup');
    console.log('================================\n');

    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment variables');
      console.log('Please set MONGO_URI in your .env file');
      process.exit(1);
    }

    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if any super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('⚠️  A super admin already exists in the system');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Name: ${existingSuperAdmin.name}`);
      
      const overwrite = await question('\nDo you want to create another super admin? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    // Get admin details
    let email, name, password, confirmPassword;

    // Email input with validation
    do {
      email = await question('Enter super admin email: ');
      if (!validateEmail(email)) {
        console.log('❌ Please enter a valid email address');
      } else {
        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
          console.log('❌ An admin with this email already exists');
          email = '';
        }
      }
    } while (!email || !validateEmail(email));

    // Name input
    do {
      name = await question('Enter super admin name: ');
      if (!name.trim()) {
        console.log('❌ Name cannot be empty');
      }
    } while (!name.trim());

    // Password input with validation
    do {
      password = await hideInput('Enter password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special): ');
      if (!validatePassword(password)) {
        console.log('❌ Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character');
      }
    } while (!validatePassword(password));

    // Confirm password
    do {
      confirmPassword = await hideInput('Confirm password: ');
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
      }
    } while (password !== confirmPassword);

    // Create super admin
    console.log('\n🔄 Creating super admin...');
    
    const superAdmin = await Admin.createSuperAdmin(email, password, name);
    
    console.log('✅ Super admin created successfully!');
    console.log('\nAdmin Details:');
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Name: ${superAdmin.name}`);
    console.log(`Role: ${superAdmin.role}`);
    console.log(`ID: ${superAdmin._id}`);
    
    console.log('\n🎉 Setup complete! You can now login to the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error.message);
    
    if (error.code === 11000) {
      console.log('This email is already registered as an admin.');
    }
    
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\nSetup cancelled by user.');
  rl.close();
  mongoose.connection.close();
  process.exit(0);
});

// Run the setup
setupSuperAdmin();

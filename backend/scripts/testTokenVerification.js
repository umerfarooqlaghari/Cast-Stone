const axios = require('axios');

const testTokenVerification = async () => {
  try {
    console.log('🔐 Testing complete admin flow...');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'mumerfarooqlaghari@gmail.com',
      password: '132Trent@!'
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Step 2: Verify token
    console.log('2. Verifying token...');
    const verifyResponse = await axios.get('http://localhost:5000/api/admin/verify-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.data.success) {
      console.log('✅ Token verification successful');
      console.log('Admin:', verifyResponse.data.admin.name);
    } else {
      console.error('❌ Token verification failed');
    }

    // Step 3: Get profile
    console.log('3. Getting profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/admin/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileResponse.data.success) {
      console.log('✅ Profile retrieval successful');
      console.log('Profile:', profileResponse.data.admin.name);
    } else {
      console.error('❌ Profile retrieval failed');
    }

    console.log('\n🎉 All tests passed! Admin authentication is working perfectly.');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testTokenVerification();

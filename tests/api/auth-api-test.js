// ChargeCars V2 Auth API Test
console.log('🔍 Testing ChargeCars V2 Authentication API...\n');

const BASE_URL = 'https://xrxc-xsc9-6egu.xano.io/api:auth';

// Test the API endpoints
async function testAuthAPI() {
  try {
    // Test 1: Try to signup a new user
    console.log('1. Testing SIGNUP endpoint...');
    
    const signupData = {
      first_name: 'Test',
      last_name: 'User',
      email: `testuser${Date.now()}@chargecars.test`,
      password: 'TestPassword123!',
      signup_type: 'customer'
    };
    
    console.log('Signup payload:', JSON.stringify(signupData, null, 2));
    
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });
    
    console.log(`Signup status: ${signupResponse.status}`);
    const signupResult = await signupResponse.json();
    console.log('Signup response:', JSON.stringify(signupResult, null, 2));
    
    if (signupResponse.ok && signupResult.authToken) {
      console.log('✅ Signup successful!\n');
      
      const token = signupResult.authToken;
      
      // Test 2: Test the /me endpoint
      console.log('2. Testing /auth/me endpoint...');
      const meResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Me endpoint status: ${meResponse.status}`);
      const meResult = await meResponse.json();
      console.log('Me response:', JSON.stringify(meResult, null, 2));
      
      if (meResponse.ok) {
        console.log('✅ /me endpoint working!\n');
      } else {
        console.log('❌ /me endpoint failed\n');
      }
      
      // Test 3: Test login with the created user
      console.log('3. Testing LOGIN endpoint...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password
        })
      });
      
      console.log(`Login status: ${loginResponse.status}`);
      const loginResult = await loginResponse.json();
      console.log('Login response:', JSON.stringify(loginResult, null, 2));
      
      if (loginResponse.ok && loginResult.authToken) {
        console.log('✅ Login successful!\n');
      } else {
        console.log('❌ Login failed\n');
      }
      
    } else {
      console.log('❌ Signup failed');
      if (signupResult.message) {
        console.log('Error:', signupResult.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  console.log('🏁 Auth API testing completed!');
}

// Run the test
testAuthAPI(); 
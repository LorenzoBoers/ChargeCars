const https = require('https');

// Base URL for the auth API
const BASE_URL = 'https://xrxc-xsc9-6egu.xano.io/api:auth';

// Helper function to make HTTP requests
function makeRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test function
async function testAuthEndpoints() {
  console.log('🔍 Testing ChargeCars V2 Auth API Endpoints\n');

  try {
    // Test 1: Try to signup a new user
    console.log('1. Testing SIGNUP endpoint...');
    const signupData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser-' + Date.now() + '@chargecars.test',
      password: 'TestPassword123!',
      signup_type: 'customer'
    };

    const signupResponse = await makeRequest('/auth/signup', 'POST', signupData);
    console.log('Signup Response:', {
      status: signupResponse.status,
      body: signupResponse.body
    });

    if (signupResponse.status === 200 && signupResponse.body.authToken) {
      console.log('✅ Signup successful!');
      const authToken = signupResponse.body.authToken;

      // Test 2: Test the /me endpoint with the token
      console.log('\n2. Testing ME endpoint with auth token...');
      const meResponse = await makeRequest('/auth/me', 'GET');
      meResponse.headers = { ...meResponse.headers, 'Authorization': `Bearer ${authToken}` };
      
      // Make the authenticated request
      const authenticatedRequest = new Promise((resolve, reject) => {
        const url = new URL('/auth/me', BASE_URL);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              const jsonBody = JSON.parse(body);
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: jsonBody
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: body
              });
            }
          });
        });

        req.on('error', (e) => {
          reject(e);
        });
        req.end();
      });

      const meResult = await authenticatedRequest;
      console.log('Me Response:', {
        status: meResult.status,
        body: meResult.body
      });

      // Test 3: Test login with the created user
      console.log('\n3. Testing LOGIN endpoint...');
      const loginData = {
        email: signupData.email,
        password: signupData.password
      };

      const loginResponse = await makeRequest('/auth/login', 'POST', loginData);
      console.log('Login Response:', {
        status: loginResponse.status,
        body: loginResponse.body
      });

      if (loginResponse.status === 200) {
        console.log('✅ Login successful!');
      } else {
        console.log('❌ Login failed');
      }

    } else {
      console.log('❌ Signup failed');
    }

  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
}

// Run the tests
testAuthEndpoints().then(() => {
  console.log('\n🏁 API endpoint testing completed!');
}).catch(console.error); 
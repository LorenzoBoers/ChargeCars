console.log('Starting ChargeCars Auth API Test...');

// Test with fetch if available, otherwise use https
async function testAuth() {
  const baseUrl = 'https://xrxc-xsc9-6egu.xano.io/api:auth';
  
  console.log('Testing auth endpoints on:', baseUrl);
  
  try {
    // Check if we're in Node.js environment
    if (typeof fetch === 'undefined') {
      console.log('Fetch not available, using https module...');
      
      // Use node-fetch or native https
      const https = require('https');
      
      function makeRequest(url, options) {
        return new Promise((resolve, reject) => {
          console.log(`Making ${options.method} request to: ${url}`);
          
          const urlObj = new URL(url);
          const requestOptions = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: options.method,
            headers: options.headers || {},
          };
          
          const req = https.request(requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              console.log(`Response status: ${res.statusCode}`);
              console.log(`Response data: ${data}`);
              
              try {
                const parsed = JSON.parse(data);
                resolve({
                  ok: res.statusCode >= 200 && res.statusCode < 300,
                  status: res.statusCode,
                  json: () => Promise.resolve(parsed)
                });
              } catch (e) {
                resolve({
                  ok: res.statusCode >= 200 && res.statusCode < 300,
                  status: res.statusCode,
                  text: () => Promise.resolve(data)
                });
              }
            });
          });
          
          req.on('error', (error) => {
            console.error('Request error:', error);
            reject(error);
          });
          
          if (options.body) {
            req.write(options.body);
          }
          
          req.end();
        });
      }
      
      // Test signup
      console.log('\n1. Testing signup...');
      const signupData = {
        first_name: 'Test',
        last_name: 'User',
        email: `testuser${Date.now()}@test.com`,
        password: 'TestPassword123!',
        signup_type: 'customer'
      };
      
      console.log('Signup data:', signupData);
      
      const signupResponse = await makeRequest(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });
      
      console.log('Signup response status:', signupResponse.status);
      
      if (signupResponse.json) {
        const signupResult = await signupResponse.json();
        console.log('Signup result:', signupResult);
        
        if (signupResult.authToken) {
          console.log('✅ Signup successful! Got auth token.');
          
          // Test /me endpoint
          console.log('\n2. Testing /me endpoint...');
          const meResponse = await makeRequest(`${baseUrl}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${signupResult.authToken}`,
              'Content-Type': 'application/json',
            }
          });
          
          console.log('Me response status:', meResponse.status);
          
          if (meResponse.json) {
            const meResult = await meResponse.json();
            console.log('Me result:', meResult);
          }
          
          // Test login
          console.log('\n3. Testing login...');
          const loginResponse = await makeRequest(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: signupData.email,
              password: signupData.password
            })
          });
          
          console.log('Login response status:', loginResponse.status);
          
          if (loginResponse.json) {
            const loginResult = await loginResponse.json();
            console.log('Login result:', loginResult);
          }
          
        } else {
          console.log('❌ No auth token in signup response');
        }
      }
      
    } else {
      console.log('Using fetch API...');
      // Use fetch for browser or modern Node.js
      // Implementation here if needed
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
  
  console.log('\n🏁 Auth API testing completed!');
}

testAuth(); 
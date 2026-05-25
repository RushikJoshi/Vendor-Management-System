const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin'
    });
    console.log('Login successful with password "admin"');
    process.exit(0);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

test();

const axios = require('axios');

async function testGst() {
  const gstin = '24AAJCC9783E1ZD'; 
  const gstinReal = '24AAJCC9783E1ZD';
  const apiKey = '694bd2b234663ca1e151b4a281305e39';
  
  const urlsToTest = [
    `http://sheet.gstincheck.co.in/check/${apiKey}/${gstinReal}`,
    `https://api.gstincheck.co.in/v1/verify?apikey=${apiKey}&gstin=${gstinReal}`,
    `https://app.gstincheck.co.in/api/v1/gst/${apiKey}/${gstinReal}`
  ];

  for (const url of urlsToTest) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { timeout: 5000 });
      console.log(`Success with ${url}`);
      console.log(res.data);
      return;
    } catch (e) {
      console.log(`Failed for ${url}: ${e.message}`);
    }
  }
}

testGst();

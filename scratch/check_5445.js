const https = require('https');
https.get('https://14.225.217.232:5445/', { rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const matches = data.match(/\/assets\/[^"'\s]+/g) || [];
    console.log('Assets found in HTML:', matches);
  });
});

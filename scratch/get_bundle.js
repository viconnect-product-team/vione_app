const https = require('https');
const fs = require('fs');

https.get('https://14.225.217.232:5445/assets/index-pVvierMF.js', { rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    fs.writeFileSync('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/scratch/index-fe.js', data);
    console.log('Downloaded JS length:', data.length);
    const matches = data.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
    console.log('API routes mentioned in bundle:', [...new Set(matches)].slice(0, 30));
  });
});

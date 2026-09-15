const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/drive/folders/1W2WiENRPh-I2YwMP3zDnwue8WmHYSwbz';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'vi,en;q=0.9',
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'No title');
    fs.writeFileSync('scratch/drive_page.html', data);
    console.log('Saved HTML to scratch/drive_page.html, size:', data.length);
  });
}).on('error', err => console.error(err));

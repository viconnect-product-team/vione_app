const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

// Parse window['_DRIVE_ivd']
const ivdMatch = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'/);
if (ivdMatch) {
  const unescaped = ivdMatch[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
                               .replace(/\\u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  try {
    const data = JSON.parse(unescaped);
    console.log('=== FILES IN DRIVE FOLDER ===');
    data[0].forEach((item, index) => {
      const id = item[0];
      const name = item[2];
      const mime = item[3];
      const size = item[13];
      console.log(`${index + 1}. [${mime}] ${name} (ID: ${id}, Size: ${size} bytes)`);
    });
  } catch (e) {
    console.error('Parse error:', e);
  }
} else {
  console.log('ivd not found');
}

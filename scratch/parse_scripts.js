const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

// Find all script tags
const scripts = html.match(/<script[\s\S]*?<\/script>/gi) || [];
console.log('Total scripts:', scripts.length);

for (let i = 0; i < scripts.length; i++) {
  const s = scripts[i];
  if (s.includes('AF_initDataCallback') || s.includes('drive') || s.includes('1W2WiENRPh')) {
    // Look for filenames or metadata
    const items = Array.from(s.matchAll(/\["([a-zA-Z0-9_-]{25,50})",\["([^"]+)"/g));
    if (items.length > 0) {
      console.log(`Script ${i} items:`, items.map(x => ({ id: x[1], name: x[2] })));
    }
  }
}

// Search for any occurrence of file title or metadata arrays
const regexAnyItem = /\["(1[a-zA-Z0-9_-]{32})",\["([^"]+)"/g;
let match;
while ((match = regexAnyItem.exec(html)) !== null) {
  console.log('Drive item found:', match[1], '=>', match[2]);
}

// Search for strings inside the folder
const stringMatches = Array.from(html.matchAll(/\["([^"\\]{3,100})",null,\["([a-zA-Z0-9_-]{25,50})"/g));
console.log('Named objects:', stringMatches.map(x => ({ name: x[1], id: x[2] })));

// Let's dump text that looks like file listings
const matches3 = Array.from(html.matchAll(/\["([^"]+)",\["([^"]+)",null,null,null,"([^"]+)"/g));
console.log('Matches3:', matches3.map(x => ({ a: x[1], b: x[2], c: x[3] })));

const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

// Search for any JSON blobs or file entries
const matches = Array.from(html.matchAll(/\["([^"]+)",\["([^"]+)"/g));
console.log('Matches count:', matches.length);

// Extract strings with extensions or names
const fileRegex = /"([^"\\]+?\.(?:png|jpg|jpeg|svg|pdf|ai|eps|zip|docx?|pptx?|txt))"/gi;
const files = new Set();
let m;
while ((m = fileRegex.exec(html)) !== null) {
  files.add(m[1]);
}
console.log('Files detected:', Array.from(files));

// Look for file IDs in drive
const idRegex = /"([a-zA-Z0-9_-]{25,50})"/g;
const ids = new Set();
while ((m = idRegex.exec(html)) !== null) {
  ids.add(m[1]);
}
console.log('Sample IDs (count ' + ids.size + '):', Array.from(ids).slice(0, 10));

// Find any Vietnamese text or brand names
const viMatches = html.match(/[\u00C0-\u1EF9a-zA-Z0-9_\-\s]{5,60}/g) || [];
const interesting = viMatches.filter(s => /logo|nhận diện|màu|quy chuẩn|hội viên|CEO|1983|brand|guide|palette/i.test(s));
console.log('Brand keywords found:', Array.from(new Set(interesting)).slice(0, 20));

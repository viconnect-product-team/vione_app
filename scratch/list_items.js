const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

// Match all items like: ["1WS7...", ... "name.ext", "mime/type"]
const pattern = /\["(1[a-zA-Z0-9_-]{25,50})",\["1W2WiENRPh-I2YwMP3zDnwue8WmHYSwbz"\],"([^"]+)","([^"]+)"/g;

let count = 0;
let m;
console.log('=== DRIVE FILES ===');
while ((m = pattern.exec(html)) !== null) {
  count++;
  console.log(`${count}. ID: ${m[1]}`);
  console.log(`   Name: ${m[2]}`);
  console.log(`   Type: ${m[3]}`);
}

// Also search for any other files in this folder
const pattern2 = /\[null,"(1[a-zA-Z0-9_-]{25,50})"\][^\n]{0,100}?"([a-zA-Z0-9_\-\.\s\(\)]+\.[a-zA-Z0-9]{2,5})"/g;
while ((m = pattern2.exec(html)) !== null) {
  console.log(`Alternative item: ${m[1]} => ${m[2]}`);
}

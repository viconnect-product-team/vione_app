const fs = require('fs');

const html = fs.readFileSync('scratch/drive_page.html', 'utf8');

const target = '1W2WiENRPh';
let pos = 0;
while ((pos = html.indexOf(target, pos)) !== -1) {
  const start = Math.max(0, pos - 200);
  const end = Math.min(html.length, pos + 400);
  console.log('--- FOUND AT POS', pos, '---');
  console.log(html.substring(start, end));
  pos += target.length;
}

const target2 = '1WS7_P2aa';
pos = 0;
while ((pos = html.indexOf(target2, pos)) !== -1) {
  const start = Math.max(0, pos - 150);
  const end = Math.min(html.length, pos + 300);
  console.log('--- FOUND AT POS', pos, '---');
  console.log(html.substring(start, end));
  pos += target2.length;
}

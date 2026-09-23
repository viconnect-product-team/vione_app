const fs = require('fs');
const content = fs.readFileSync('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/scratch/index-fe.js', 'utf8');

// Find all occurrences of "communities"
let idx = 0;
while ((idx = content.indexOf('communities', idx)) !== -1) {
  const start = Math.max(0, idx - 50);
  const end = Math.min(content.length, idx + 100);
  console.log('Match at', idx, ':', content.slice(start, end));
  idx += 'communities'.length;
}

const fs = require('fs');
const content = fs.readFileSync('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/scratch/index-fe.js', 'utf8');
const idx = 3396959;
console.log(content.slice(idx - 500, idx + 1000));

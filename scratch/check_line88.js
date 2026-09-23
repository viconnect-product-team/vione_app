const fs = require('fs');
const content = fs.readFileSync('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/scratch/index-fe.js', 'utf8');

// Find occurrences of fetchNestApi or fetch(
const lines = content.split('\n');
console.log('Total lines:', lines.length);
if (lines.length >= 88) {
  console.log('Line 88 snippet:', lines[87].slice(0, 300));
}

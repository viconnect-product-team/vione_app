const fs = require('fs');
const content = fs.readFileSync('apps/vione_app_fe/src/routes/association.index.tsx', 'utf8');
const lines = content.split('\n');
let depth = 0;
lines.forEach((l, idx) => {
  const opens = (l.match(/<div(?:\s+[^>]*[^\/])?>/g) || []).length;
  const closes = (l.match(/<\/div>/g) || []).length;
  if (opens || closes) {
    depth += opens - closes;
    console.log(`L${idx+1}: opens ${opens}, closes ${closes}, net ${depth} | ${l.trim().slice(0, 60)}`);
  }
});
console.log('Final net:', depth);

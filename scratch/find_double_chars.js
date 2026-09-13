const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const p = path.join(dir, file);
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.git') && !p.includes('.output') && !p.includes('dist')) {
        results = results.concat(walk(p));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(p);
    }
  });
  return results;
}

const files = walk('apps/vione_app_fe/src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/^\s*[+-]\s+[\p{L}]/u.test(line)) {
      console.log(`${f}:${idx+1}: ${line.trim()}`);
    }
  });
});

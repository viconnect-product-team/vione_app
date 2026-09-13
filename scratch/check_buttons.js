const fs = require('fs');

['V2', 'V3', 'V4', 'V5'].forEach(v => {
  const file = 'apps/vione_app_fe/src/components/landing/BusinessConnectLanding' + v + '.tsx';
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  console.log(`\n================== ${v} ==================`);
  lines.forEach((line, i) => {
    if ((line.includes('<button') || line.includes('setShowDemoModal') || line.includes('setShowVideoModal') || line.includes('Đặt demo') || line.includes('Xem video') || line.includes('bg-')) && (line.includes('theme ===') || line.includes('bg-cyan') || line.includes('bg-orange') || line.includes('from-cyan') || line.includes('from-orange'))) {
      console.log(`L${i + 1}: ${line.trim()}`);
    }
  });
});

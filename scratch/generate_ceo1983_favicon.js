const sharp = require('sharp');
const fs = require('fs');

async function makeFavicons() {
  const src = 'apps/vione_app_fe/public/ceo1983-official-logo.png';
  
  // 64x64 favicon with white rounded background
  const size = 64;
  const inner = await sharp(src).resize(52, null, { fit: 'inside' }).toBuffer();
  
  const svgBg = Buffer.from(
    '<svg width="64" height="64"><rect width="64" height="64" rx="14" fill="#FFFFFF"/></svg>'
  );

  const favicon = await sharp({
    create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([
    { input: svgBg, blend: 'over' },
    { input: inner, gravity: 'centre' }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync('apps/vione_app_fe/public/ceo1983-favicon.png', favicon);
  fs.writeFileSync('apps/vione_app_fe/public/landing/ceo1983-favicon.png', favicon);
  console.log('Saved crisp white rounded ceo1983-favicon.png (64x64)');
}

makeFavicons().catch(console.error);

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const sourceLogo = 'apps/vione_app_fe/public/ceo1983-official-logo.png';
  if (!fs.existsSync(sourceLogo)) {
    throw new Error('Source logo not found at ' + sourceLogo);
  }

  // 1. Assets Master Icons
  const masterBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: await sharp(sourceLogo).resize(760, null, { fit: 'inside' }).toBuffer(),
    gravity: 'centre'
  }])
  .png()
  .toBuffer();

  fs.writeFileSync('apps/mobile_ceo1983/assets/icon.png', masterBuffer);
  fs.writeFileSync('apps/mobile_ceo1983/assets/adaptive-icon.png', masterBuffer);

  // Favicon (192x192)
  await sharp(masterBuffer)
    .resize(192, 192)
    .png()
    .toFile('apps/mobile_ceo1983/assets/favicon.png');

  // iOS AppIcon (1024x1024)
  const iosIconPath = 'apps/mobile_ceo1983/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png';
  if (fs.existsSync(path.dirname(iosIconPath))) {
    fs.writeFileSync(iosIconPath, masterBuffer);
    console.log('Saved iOS AppIcon-512@2x.png');
  }

  // Android mipmap densities
  const densities = [
    { name: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { name: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { name: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { name: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { name: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  const resDir = 'apps/mobile_ceo1983/android/app/src/main/res';

  for (const d of densities) {
    const targetDir = path.join(resDir, d.name);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // A. ic_launcher.png (square with white bg)
    await sharp(masterBuffer)
      .resize(d.size, d.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // B. ic_launcher_round.png (circle crop on white bg)
    const radius = d.size / 2;
    const circleSvg = Buffer.from(
      `<svg width="${d.size}" height="${d.size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#fff"/></svg>`
    );

    const roundIcon = await sharp(masterBuffer)
      .resize(d.size, d.size)
      .composite([{
        input: circleSvg,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundIcon);

    // C. ic_launcher_foreground.png (transparent bg, logo width ~66% of fgSize)
    const logoWidth = Math.round(d.fgSize * 0.70);
    const innerLogo = await sharp(sourceLogo)
      .resize(logoWidth, null, { fit: 'inside' })
      .toBuffer();

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: innerLogo,
      gravity: 'centre'
    }])
    .png()
    .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${d.name} (${d.size}x${d.size}, fg: ${d.fgSize}x${d.fgSize})`);
  }

  console.log('ALL MOBILE CEO1983 ICONS GENERATED SUCCESSFULLY!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});

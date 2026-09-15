const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('scratch/build_ceo1983_standard_pdf.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Update getPalette with navCenterBg, navCenterBorder, navCenterIconColor for each option
const pa1Old = `tabActive: '#003B95',
      navCenterBorder: '#003B95'`;
const pa1New = `tabActive: '#003B95',
      navCenterBg: '#003B95',
      navCenterBorder: '#f59e0b',
      navCenterIconColor: '#f59e0b'`;

const pa2Old = `tabActive: '#0284c7',
      navCenterBorder: '#0284c7'`;
const pa2New = `tabActive: '#0284c7',
      navCenterBg: '#0284c7',
      navCenterBorder: '#38bdf8',
      navCenterIconColor: '#ffffff'`;

const pa3Old = `tabActive: '#0f172a',
      navCenterBorder: '#ea580c'`;
const pa3New = `tabActive: '#0f172a',
      navCenterBg: '#ea580c',
      navCenterBorder: '#fdba74',
      navCenterIconColor: '#ffffff'`;

code = code.replace(pa1Old, pa1New);
code = code.replace(pa2Old, pa2New);
code = code.replace(pa3Old, pa3New);

// 2. Replace the center button in all bottom navbars with QR Button styled per option
const oldCenterButtonRegex = /<div class="m-nav-center" style="border-color:\$\{p\.navCenterBorder\};">[\s\S]*?<\/div>/g;

const newCenterButton = `<div class="m-nav-center" style="background:\${p.navCenterBg}; border-color:\${p.navCenterBorder}; box-shadow: 0 2px 7px rgba(0,0,0,0.25);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="\${p.navCenterIconColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="3" height="3" rx="0.5"/>
            <path d="M14 20h3a1 1 0 0 0 1-1v-2"/>
            <path d="M20 20v.01"/>
          </svg>
        </div>`;

const matches = code.match(oldCenterButtonRegex);
console.log(`Found ${matches ? matches.length : 0} center button matches.`);

code = code.replace(oldCenterButtonRegex, newCenterButton);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully updated build_ceo1983_standard_pdf.js with QR buttons styled per option!');

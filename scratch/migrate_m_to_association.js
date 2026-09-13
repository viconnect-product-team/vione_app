const fs = require('fs');
const path = require('path');

const routesDir = path.resolve(__dirname, '../apps/vione_app_fe/src/routes');

const mFiles = fs.readdirSync(routesDir).filter(f => f.startsWith('m.') && f.endsWith('.tsx'));

console.log('Found m.*.tsx files:', mFiles.length);

for (const f of mFiles) {
  const oldPath = path.join(routesDir, f);
  const newName = f.replace(/^m\./, 'association.');
  const newPath = path.join(routesDir, newName);

  let content = fs.readFileSync(oldPath, 'utf8');

  // Replace createFileRoute("/m...") with createFileRoute("/association...")
  content = content.replace(/createFileRoute\(["']\/m(.*?)["']\)/g, (match, p1) => {
    return `createFileRoute("/association${p1}")`;
  });

  // Replace links to /m with to /association
  content = content.replace(/(['"`])\/m\/([^'"`]*)(['"`])/g, '$1/association/$2$3');
  content = content.replace(/(['"`])\/m(['"`])/g, '$1/association$2');

  fs.writeFileSync(newPath, content, 'utf8');
  console.log(`  -> Created ${newName}`);
}

// Now update m.tsx to redirect to /association
const mRootPath = path.join(routesDir, 'm.tsx');
const mRootContent = `import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/m")({
  beforeLoad: ({ location }) => {
    const target = location.pathname.replace(/^\\/m/, "/association") || "/association";
    throw redirect({
      to: target as any,
      search: location.search as any,
    });
  },
  component: () => <Outlet />,
});
`;
fs.writeFileSync(mRootPath, mRootContent, 'utf8');
console.log('Updated m.tsx to redirect to /association');

console.log('Migration completed successfully.');

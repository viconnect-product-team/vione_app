const fs = require('fs');

// 1. Fix V3
let v3 = fs.readFileSync('apps/vione_app_fe/src/components/landing/BusinessConnectLandingV3.tsx', 'utf8');
v3 = v3.replace(
  'theme === "dark"\n                  ? "bg-orange-500 text-black border border-orange-400 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"',
  'theme === "dark"\n                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)]"'
);
v3 = v3.replace(
  'theme === "dark"\n                    ? "bg-orange-500 text-black border border-orange-400 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]"',
  'theme === "dark"\n                    ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold border border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]"'
);
v3 = v3.replace(
  'theme === "dark"\n                  ? "bg-orange-500 text-black border border-orange-400 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"',
  'theme === "dark"\n                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)]"'
);
v3 = v3.replace(
  'className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-orange-500 text-black hover:bg-orange-400 transition mt-4"',
  'className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-md hover:shadow-lg transition mt-4"'
);
fs.writeFileSync('apps/vione_app_fe/src/components/landing/BusinessConnectLandingV3.tsx', v3, 'utf8');
console.log('Fixed V3 buttons!');

// 2. Fix V4
let v4 = fs.readFileSync('apps/vione_app_fe/src/components/landing/BusinessConnectLandingV4.tsx', 'utf8');
v4 = v4.replace(
  'theme === "dark"\n                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"',
  'theme === "dark"\n                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)]"'
);
v4 = v4.replace(
  'theme === "dark"\n                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"',
  'theme === "dark"\n                    ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]"'
);
v4 = v4.replace(
  'theme === "dark"\n                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"',
  'theme === "dark"\n                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_25px_rgba(245,158,11,0.4)]"'
);
v4 = v4.replace(
  'className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition mt-4 shadow-lg"',
  'className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition mt-4"'
);
fs.writeFileSync('apps/vione_app_fe/src/components/landing/BusinessConnectLandingV4.tsx', v4, 'utf8');
console.log('Fixed V4 buttons!');

// 3. Fix V5
let v5 = fs.readFileSync('apps/vione_app_fe/src/components/landing/BusinessConnectLandingV5.tsx', 'utf8');
v5 = v5.replace(
  'theme === "dark"\n                  ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"',
  'theme === "dark"\n                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)]"'
);
v5 = v5.replace(
  'theme === "dark"\n                    ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"',
  'theme === "dark"\n                    ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]"'
);
v5 = v5.replace(
  'theme === "dark"\n                  ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"',
  'theme === "dark"\n                  ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)]"'
);
v5 = v5.replace(
  'className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 transition mt-4 shadow-lg"',
  'className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition mt-4"'
);
fs.writeFileSync('apps/vione_app_fe/src/components/landing/BusinessConnectLandingV5.tsx', v5, 'utf8');
console.log('Fixed V5 buttons!');

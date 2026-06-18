const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(publicDir, 'assets');
const dirs = [
  path.join(assetsDir, 'materials'),
  path.join(assetsDir, 'concepts'),
  path.join(assetsDir, 'photos'),
  path.join(assetsDir, 'invoices')
];

// Ensure directories exist
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to write SVG file
function writeSvg(filePath, svgContent) {
  fs.writeFileSync(filePath, svgContent.trim());
}

// Generate Materials SVGs
const materials = {
  'carrara_tile.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1f5f9"/><path d="M 0,50 Q 80,45 100,100 T 200,150 M 50,0 Q 120,80 150,200" stroke="#cbd5e1" stroke-width="2" fill="none"/></svg>`,
  'chevron_tile.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#334155"/><path d="M0 50 L50 20 L100 50 L150 20 L200 50 M0 100 L50 70 L100 100 L150 70 L200 100 M0 150 L50 120 L100 150 L150 120 L200 150" stroke="#475569" stroke-width="4" fill="none"/></svg>`,
  'teak_laminate.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#78350f"/><path d="M10 0 C 15 50, 5 100, 12 200 M60 0 C 50 60, 70 120, 58 200 M110 0 C 115 50, 105 150, 112 200 M160 0 C 150 80, 170 140, 162 200" stroke="#92400e" stroke-width="3" fill="none"/></svg>`,
  'charcoal_laminate.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1e293b"/><path d="M0 0 L200 200 M200 0 L0 200" stroke="#334155" stroke-width="1" fill="none"/></svg>`,
  'warm_alabaster.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#fafaf9"/><circle cx="100" cy="100" r="50" fill="#f5f5f4" opacity="0.5"/></svg>`,
  'deep_teal.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0d9488"/><circle cx="100" cy="100" r="40" fill="#0f766e" opacity="0.6"/></svg>`,
  'track_light.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0f172a"/><rect x="20" y="90" width="160" height="20" rx="4" fill="#334155"/><circle cx="50" cy="100" r="15" fill="#fef08a"/><circle cx="100" cy="100" r="15" fill="#fef08a"/><circle cx="150" cy="100" r="15" fill="#fef08a"/></svg>`,
  'cob_light.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0f172a"/><circle cx="100" cy="100" r="45" fill="#1e293b" stroke="#334155" stroke-width="2"/><circle cx="100" cy="100" r="25" fill="#fef08a"/></svg>`,
  'velvet_sofa.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#064e3b"/><rect x="30" y="80" width="140" height="70" rx="10" fill="#065f46"/><rect x="45" y="100" width="110" height="40" rx="5" fill="#047857"/></svg>`,
  'office_chair.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#334155"/><line x1="100" y1="120" x2="100" y2="170" stroke="#1e293b" stroke-width="8"/><line x1="70" y1="170" x2="130" y2="170" stroke="#1e293b" stroke-width="10"/><rect x="60" y="60" width="80" height="60" rx="6" fill="#1e293b"/></svg>`,
  'brass_handle.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1e293b"/><rect x="40" y="90" width="120" height="20" rx="5" fill="#d97706"/><circle cx="60" cy="100" r="6" fill="#b45309"/><circle cx="140" cy="100" r="6" fill="#b45309"/></svg>`,
  'drawer_slides.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#334155"/><rect x="10" y="95" width="180" height="10" fill="#94a3b8"/><circle cx="50" cy="100" r="4" fill="#cbd5e1"/><circle cx="150" cy="100" r="4" fill="#cbd5e1"/></svg>`,
  'beige_curtain.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#d6d3d1"/><path d="M20 0 C30 50, 10 150, 20 200 M60 0 C70 50, 50 150, 60 200 M100 0 C110 50, 90 150, 100 200 M140 0 C150 50, 130 150, 140 200 M180 0 C190 50, 170 150, 180 200" stroke="#a8a29e" stroke-width="4" fill="none"/></svg>`,
  'rust_boucle.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#c2410c"/><circle cx="50" cy="50" r="10" fill="#9a3412"/><circle cx="150" cy="80" r="15" fill="#9a3412"/><circle cx="90" cy="130" r="20" fill="#9a3412"/></svg>`
};

// Generate Concept SVGs
const concepts = {
  'luxury_living.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#111827"/><text x="200" y="140" fill="#c5a880" font-family="sans-serif" font-size="20" text-anchor="middle" font-weight="bold">CLASSIC LUXURY CONCEPT</text><text x="200" y="170" fill="#9ca3af" font-family="sans-serif" font-size="14" text-anchor="middle">Glory Simon Showcase Vibe</text><rect x="50" y="220" width="300" height="40" fill="none" stroke="#c5a880" stroke-width="2" rx="4"/></svg>`,
  'modern_living.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1e293b"/><text x="200" y="140" fill="#38bdf8" font-family="sans-serif" font-size="20" text-anchor="middle" font-weight="bold">WARM MODERNIST LAYOUT</text><text x="200" y="170" fill="#cbd5e1" font-family="sans-serif" font-size="14" text-anchor="middle">Teak cladding &amp; Slate tiles</text></svg>`,
  'kitchen_minimalist.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#0f172a"/><text x="200" y="140" fill="#34d399" font-family="sans-serif" font-size="20" text-anchor="middle" font-weight="bold">MINIMALIST CULINARY CONCEPT</text><text x="200" y="170" fill="#94a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Integrated Acrylic Flat Panels</text></svg>`,
  'boardroom.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1c1917"/><text x="200" y="140" fill="#fbbf24" font-family="sans-serif" font-size="20" text-anchor="middle" font-weight="bold">BOARDROOM STYLE GUIDE</text><text x="200" y="170" fill="#a8a29e" font-family="sans-serif" font-size="14" text-anchor="middle">Acoustic Felt Grid Layout</text></svg>`
};

// Generate Site Visit photos
const photos = {
  'visit_rathod_1.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#334155"/><text x="150" y="90" fill="#fff" font-size="14" text-anchor="middle" font-family="sans-serif">Rathod Penthouse Site Inspection</text><text x="150" y="120" fill="#cbd5e1" font-size="12" text-anchor="middle" font-family="sans-serif">Rahul Dev (Site Engineer)</text></svg>`,
  'visit_nexus_1.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#334155"/><text x="150" y="90" fill="#fff" font-size="14" text-anchor="middle" font-family="sans-serif">Nexus Corporate Site Visit</text><text x="150" y="120" fill="#cbd5e1" font-size="12" text-anchor="middle" font-family="sans-serif">Dimensions verified</text></svg>`,
  'visit_priya_1.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#334155"/><text x="150" y="90" fill="#fff" font-size="14" text-anchor="middle" font-family="sans-serif">Priya Apartment Inspection</text><text x="150" y="120" fill="#cbd5e1" font-size="12" text-anchor="middle" font-family="sans-serif">Living Space Mockups</text></svg>`,
  'placeholder_visit.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#1e293b"/><text x="150" y="100" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="sans-serif">Site Photo Logging Active</text></svg>`
};

// Write materials
Object.entries(materials).forEach(([name, content]) => {
  writeSvg(path.join(assetsDir, 'materials', name), content);
});

// Write concepts
Object.entries(concepts).forEach(([name, content]) => {
  writeSvg(path.join(assetsDir, 'concepts', name), content);
});

// Write photos
Object.entries(photos).forEach(([name, content]) => {
  writeSvg(path.join(assetsDir, 'photos', name), content);
});

// Write a mock empty document for invoices PDF simulation
fs.writeFileSync(path.join(assetsDir, 'invoices', 'placeholder_invoice.pdf'), 'MOCK PDF DATA');

console.log('All SVG asset files generated successfully.');

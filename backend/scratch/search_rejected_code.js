const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/frontend/src';

function traverse(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('REJECTED') || line.includes('Rejected')) {
          console.log(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  });
}

traverse(srcDir);

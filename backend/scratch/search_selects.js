const fs = require('fs');
const path = require('path');

const frontendDir = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/frontend/src';

function searchInDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchInDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<select')) {
        console.log(`Found <select in file: ${fullPath}`);
        // Find line numbers
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('<select')) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
}

searchInDir(frontendDir);

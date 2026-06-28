const fs = require('fs');
const path = require('path');

const appJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/frontend/src/App.tsx';
const content = fs.readFileSync(appJsPath, 'utf8');
const lines = content.split('\n');

console.log(lines.slice(910, 975).join('\n'));

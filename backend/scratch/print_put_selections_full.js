const fs = require('fs');
const path = require('path');

const serverJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/backend/server.js';
const content = fs.readFileSync(serverJsPath, 'utf8');
const lines = content.split('\n');

console.log(lines.slice(410, 480).join('\n'));

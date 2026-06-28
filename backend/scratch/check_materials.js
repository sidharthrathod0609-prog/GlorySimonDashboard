const fs = require('fs');
const path = require('path');

const dbPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/backend/database.js';
const content = fs.readFileSync(dbPath, 'utf8');
const lines = content.split('\n');

// Find lines containing "INSERT INTO materials"
lines.forEach((line, index) => {
  if (line.includes('INSERT INTO materials')) {
    console.log(`Line ${index + 1}:`);
    console.log(lines.slice(index, index + 35).join('\n'));
  }
});

const fs = require('fs');
const path = require('path');

const serverJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/backend/server.js';
if (fs.existsSync(serverJsPath)) {
  const content = fs.readFileSync(serverJsPath, 'utf8');
  const lines = content.split('\n');
  console.log('Searching in server.js:');
  lines.forEach((line, index) => {
    if (line.includes('CREATE TABLE')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

const dbJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/backend/database.js';
if (fs.existsSync(dbJsPath)) {
  const content = fs.readFileSync(dbJsPath, 'utf8');
  const lines = content.split('\n');
  console.log('Searching in database.js:');
  lines.forEach((line, index) => {
    if (line.includes('CREATE TABLE')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

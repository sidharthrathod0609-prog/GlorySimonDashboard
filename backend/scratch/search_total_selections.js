const fs = require('fs');
const path = require('path');

const serverJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/backend/server.js';
const content = fs.readFileSync(serverJsPath, 'utf8');

function findOccurrences(query) {
  console.log(`Searching for "${query}":`);
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

findOccurrences('total_selections');
findOccurrences('approved_selections');
findOccurrences('app.get(\'/api/projects\'');

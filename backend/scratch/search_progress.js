const fs = require('fs');
const path = require('path');

const appJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/frontend/src/App.tsx';
const content = fs.readFileSync(appJsPath, 'utf8');

function findOccurrences(query) {
  console.log(`Searching for "${query}":`);
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

findOccurrences('PROJECT PROGRESS & VITALITY');
findOccurrences('progress');
findOccurrences('vitality');

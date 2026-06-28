const fs = require('fs');
const path = require('path');

const storeJsPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/frontend/src/store/useAppStore.ts';
const content = fs.readFileSync(storeJsPath, 'utf8');

function findOccurrences(query) {
  console.log(`Searching for "${query}":`);
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

findOccurrences('createClient');
findOccurrences('deleteClient');

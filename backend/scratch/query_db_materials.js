const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'c:/Users/Sidharth Rathod/Desktop/CDU/GlorySimon_Dashboard/backend/glorysimon.db';
const db = new sqlite3.Database(dbPath);

console.log('Querying materials:');
db.all('SELECT * FROM materials', (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(rows);
  }

  console.log('\nQuerying material_selections:');
  db.all('SELECT * FROM material_selections', (err, rows2) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows2);
    }
    db.close();
  });
});

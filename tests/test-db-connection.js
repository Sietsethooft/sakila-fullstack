const pool = require('../src/models/db');

pool.query('SELECT 1 AS test', (err, results) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connection successful:', results);
  }
  pool.end();
});
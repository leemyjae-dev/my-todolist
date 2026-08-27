const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

console.log('[db] pool created');

pool.on('error', (err) => console.error('[db] pool error', err));

module.exports = pool;

require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const pool = require('../src/db/pool');

test.after(async () => {
  await pool.end();
});

test('pool module returns the same instance on repeated require', () => {
  const a = require('../src/db/pool');
  const b = require('../src/db/pool');
  assert.strictEqual(a, b);
});

test('pool can query the database', async () => {
  const { rows } = await pool.query('SELECT 1 AS ok');
  assert.strictEqual(Number(rows[0].ok), 1);
});

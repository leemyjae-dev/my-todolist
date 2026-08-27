const test = require('node:test');
const assert = require('node:assert');
const { start } = require('../src/server');

let server;
let baseUrl;

test.before(async () => {
  server = start(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET / on undefined route returns Express default 404', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.strictEqual(res.status, 404);
});

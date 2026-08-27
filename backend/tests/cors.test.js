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

test('allowed origin gets Access-Control-Allow-Origin header', async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { Origin: process.env.CORS_ORIGIN },
  });
  assert.strictEqual(res.headers.get('access-control-allow-origin'), process.env.CORS_ORIGIN);
});

test('disallowed origin gets no Access-Control-Allow-Origin header', async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'http://evil.example.com' },
  });
  assert.strictEqual(res.headers.get('access-control-allow-origin'), null);
});

test('OPTIONS preflight returns 204', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'OPTIONS',
    headers: { Origin: process.env.CORS_ORIGIN },
  });
  assert.strictEqual(res.status, 204);
});

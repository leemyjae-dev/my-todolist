require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const { signAccessToken } = require('../src/shared/jwt');
const authMiddleware = require('../src/middlewares/auth');

let server;
let baseUrl;

test.before(async () => {
  const app = express();
  app.get('/protected', authMiddleware, (req, res) => {
    res.json({ userId: req.user.id });
  });
  server = app.listen(0);
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

test('missing Authorization header returns 401', async () => {
  const res = await fetch(`${baseUrl}/protected`);
  const body = await res.json();
  assert.strictEqual(res.status, 401);
  assert.strictEqual(body.error.code, 'UNAUTHORIZED');
});

test('valid token returns 200 with user id', async () => {
  const token = signAccessToken({ sub: 'u1' });
  const res = await fetch(`${baseUrl}/protected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(body, { userId: 'u1' });
});

test('invalid token returns 401', async () => {
  const res = await fetch(`${baseUrl}/protected`, {
    headers: { Authorization: 'Bearer not-a-real-token' },
  });
  const body = await res.json();
  assert.strictEqual(res.status, 401);
  assert.strictEqual(body.error.code, 'UNAUTHORIZED');
});

const test = require('node:test');
const assert = require('node:assert');
const { start } = require('../src/server');
const pool = require('../src/db/pool');

let server;
let baseUrl;
const emails = [];

function randomEmail() {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  emails.push(email);
  return email;
}

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
  if (emails.length > 0) {
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [emails]);
  }
});

test('POST /auth/signup succeeds with 201 and user body', async () => {
  const email = randomEmail();
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', name: '홍길동' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(body.email, email);
  assert.strictEqual(body.name, '홍길동');
  assert.strictEqual(body.password, undefined);
});

test('POST /auth/signup fails with 400 for short password', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: randomEmail(), password: '1234567', name: '홍길동' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('POST /auth/signup fails with 400 for invalid email format', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'password123', name: '홍길동' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('POST /auth/signup fails with 400 for too long name', async () => {
  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: randomEmail(), password: 'password123', name: 'a'.repeat(51) }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('POST /auth/signup fails with 409 for duplicate email', async () => {
  const email = randomEmail();
  await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', name: '홍길동' }),
  });

  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', name: '홍길동' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 409);
  assert.strictEqual(body.error.code, 'EMAIL_TAKEN');
});

test('POST /auth/login succeeds with 200 and tokens', async () => {
  const email = randomEmail();
  const password = 'password123';
  await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: '홍길동' }),
  });

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(typeof body.accessToken, 'string');
  assert.strictEqual(typeof body.refreshToken, 'string');
  assert.strictEqual(body.user.email, email);
});

test('POST /auth/login fails with 401 for wrong password', async () => {
  const email = randomEmail();
  await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', name: '홍길동' }),
  });

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrongpassword' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 401);
  assert.strictEqual(body.error.code, 'INVALID_CREDENTIALS');
});

test('POST /auth/token/refresh succeeds with 200 and accessToken', async () => {
  const email = randomEmail();
  const password = 'password123';
  await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: '홍길동' }),
  });
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { refreshToken } = await loginRes.json();

  const res = await fetch(`${baseUrl}/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(typeof body.accessToken, 'string');
});

test('POST /auth/token/refresh fails with 401 for invalid token', async () => {
  const res = await fetch(`${baseUrl}/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: 'not-a-real-token' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 401);
  assert.strictEqual(body.error.code, 'INVALID_REFRESH_TOKEN');
});

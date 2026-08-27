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

async function signupAndLogin(password = 'password123') {
  const email = randomEmail();
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
  const { accessToken } = await loginRes.json();
  return { email, password, accessToken };
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

test('GET /users/me fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/users/me`);
  assert.strictEqual(res.status, 401);
});

test('GET /users/me succeeds with 200 and no password field', async () => {
  const { email, accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.email, email);
  assert.strictEqual(body.password, undefined);
});

test('PATCH /users/me updates name only, keeps email', async () => {
  const { email, accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ name: '김철수' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.name, '김철수');
  assert.strictEqual(body.email, email);
});

test('PATCH /users/me updates password only, old password fails login and new one succeeds', async () => {
  const { email, password, accessToken } = await signupAndLogin();
  const newPassword = 'newpassword123';
  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password: newPassword }),
  });
  assert.strictEqual(res.status, 200);

  const oldLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.strictEqual(oldLoginRes.status, 401);

  const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: newPassword }),
  });
  assert.strictEqual(newLoginRes.status, 200);
});

test('PATCH /users/me fails with 400 for too long name', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ name: 'a'.repeat(51) }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('PATCH /users/me fails with 400 for too short password', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password: '1234567' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('PATCH /users/me fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '김철수' }),
  });
  assert.strictEqual(res.status, 401);
});

test('PATCH /users/me updates updatedAt to a later timestamp', async () => {
  const { accessToken } = await signupAndLogin();
  const before = await fetch(`${baseUrl}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const beforeBody = await before.json();

  await new Promise((resolve) => setTimeout(resolve, 10));

  const res = await fetch(`${baseUrl}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ name: '박영희' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(new Date(body.updatedAt).getTime() > new Date(beforeBody.updatedAt).getTime());
});

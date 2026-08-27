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

function authHeaders(accessToken) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
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
    await pool.query(
      'DELETE FROM todos WHERE user_id = ANY(SELECT id FROM users WHERE email = ANY($1))',
      [emails]
    );
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [emails]);
  }
});

test('POST /categories fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '업무' }),
  });
  assert.strictEqual(res.status, 401);
});

test('POST /categories succeeds with 201 and isDefault false', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name: '업무' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 201);
  assert.strictEqual(body.name, '업무');
  assert.strictEqual(body.isDefault, false);
  assert.strictEqual(typeof body.id, 'string');
});

test('POST /categories fails with 409 for duplicate name for same user', async () => {
  const { accessToken } = await signupAndLogin();
  await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name: '업무' }),
  });
  const res = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name: '업무' }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 409);
  assert.strictEqual(body.error.code, 'CATEGORY_NAME_TAKEN');
});

test('POST /categories fails with 400 for name over 50 chars', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name: 'a'.repeat(51) }),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
});

test('GET /categories fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/categories`);
  assert.strictEqual(res.status, 401);
});

test('GET /categories returns own categories including default, excludes other user categories', async () => {
  const userA = await signupAndLogin();
  const userB = await signupAndLogin();

  await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(userA.accessToken),
    body: JSON.stringify({ name: '개인' }),
  });
  await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(userB.accessToken),
    body: JSON.stringify({ name: 'B전용' }),
  });

  const res = await fetch(`${baseUrl}/categories`, {
    headers: authHeaders(userA.accessToken),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(body));
  const names = body.map((c) => c.name);
  assert.ok(names.includes('개인'));
  assert.ok(!names.includes('B전용'));
  const defaultCategory = body.find((c) => c.isDefault === true);
  assert.ok(defaultCategory, 'default category should exist');
});

test('DELETE /categories/:id fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/categories/00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
  });
  assert.strictEqual(res.status, 401);
});

test('DELETE /categories/:id fails with 404 when deleting another user category', async () => {
  const userA = await signupAndLogin();
  const userB = await signupAndLogin();

  const createRes = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(userA.accessToken),
    body: JSON.stringify({ name: 'A전용' }),
  });
  const created = await createRes.json();

  const res = await fetch(`${baseUrl}/categories/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(userB.accessToken),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(body.error.code, 'NOT_FOUND');
});

test('DELETE /categories/:id fails with 400 for default category', async () => {
  const { accessToken } = await signupAndLogin();
  const listRes = await fetch(`${baseUrl}/categories`, {
    headers: authHeaders(accessToken),
  });
  const list = await listRes.json();
  const defaultCategory = list.find((c) => c.isDefault === true);

  const res = await fetch(`${baseUrl}/categories/${defaultCategory.id}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(body.error.code, 'DEFAULT_CATEGORY_UNDELETABLE');
});

test('DELETE /categories/:id succeeds with 204 and moves its todos to default category', async () => {
  const { accessToken } = await signupAndLogin();
  const listRes = await fetch(`${baseUrl}/categories`, {
    headers: authHeaders(accessToken),
  });
  const list = await listRes.json();
  const defaultCategory = list.find((c) => c.isDefault === true);

  const createRes = await fetch(`${baseUrl}/categories`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ name: '삭제될카테고리' }),
  });
  const category = await createRes.json();

  const meRes = await fetch(`${baseUrl}/users/me`, {
    headers: authHeaders(accessToken),
  });
  const me = await meRes.json();

  const { rows: insertedTodos } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, start_date, end_date)
     VALUES ($1, $2, '할일1', '2026-01-01', '2026-01-02'),
            ($1, $2, '할일2', '2026-01-01', '2026-01-02')
     RETURNING id`,
    [me.id, category.id]
  );
  const todoIds = insertedTodos.map((t) => t.id);

  const res = await fetch(`${baseUrl}/categories/${category.id}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });
  assert.strictEqual(res.status, 204);

  const { rows: movedTodos } = await pool.query(
    'SELECT category_id FROM todos WHERE id = ANY($1)',
    [todoIds]
  );
  assert.strictEqual(movedTodos.length, 2);
  for (const todo of movedTodos) {
    assert.strictEqual(todo.category_id, defaultCategory.id);
  }

  const { rows: remainingCategory } = await pool.query(
    'SELECT id FROM categories WHERE id = $1',
    [category.id]
  );
  assert.strictEqual(remainingCategory.length, 0);
});

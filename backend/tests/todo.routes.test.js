const test = require('node:test');
const assert = require('node:assert');
const { start } = require('../src/server');
const pool = require('../src/db/pool');

let server;
let baseUrl;
const emails = [];

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

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

async function getDefaultCategoryId(accessToken) {
  const res = await fetch(`${baseUrl}/categories`, { headers: authHeaders(accessToken) });
  const list = await res.json();
  return list.find((c) => c.isDefault === true).id;
}

function createTodo(accessToken, body) {
  return fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
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

test('POST /todos fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '할일', startDate: today, endDate: today }),
  });
  assert.strictEqual(res.status, 401);
});

test('POST /todos succeeds with 201 and applies default category', async () => {
  const { accessToken } = await signupAndLogin();
  const defaultCategoryId = await getDefaultCategoryId(accessToken);

  const res = await createTodo(accessToken, { title: '할일', startDate: today, endDate: today });
  const body = await res.json();

  assert.strictEqual(res.status, 201);
  assert.strictEqual(body.categoryId, defaultCategoryId);
  assert.strictEqual(body.status, 'IN_PROGRESS');
});

test('POST /todos fails with 400 when title is missing', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await createTodo(accessToken, { startDate: today, endDate: today });
  assert.strictEqual(res.status, 400);
});

test('POST /todos fails with 400 when startDate is after endDate', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await createTodo(accessToken, { title: '할일', startDate: tomorrow, endDate: today });
  assert.strictEqual(res.status, 400);
});

test('POST /todos fails with 404 when categoryId belongs to another user', async () => {
  const userA = await signupAndLogin();
  const userB = await signupAndLogin();
  const userBDefaultCategoryId = await getDefaultCategoryId(userB.accessToken);

  const res = await createTodo(userA.accessToken, {
    title: '할일',
    startDate: today,
    endDate: today,
    categoryId: userBDefaultCategoryId,
  });
  assert.strictEqual(res.status, 404);
});

test('GET /todos filters by status correctly', async () => {
  const { accessToken } = await signupAndLogin();

  const notStartedRes = await createTodo(accessToken, {
    title: '예정된 할일',
    startDate: tomorrow,
    endDate: tomorrow,
  });
  const notStarted = await notStartedRes.json();

  const inProgressRes = await createTodo(accessToken, {
    title: '진행중 할일',
    startDate: yesterday,
    endDate: tomorrow,
  });
  const inProgress = await inProgressRes.json();

  const overdueRes = await createTodo(accessToken, {
    title: '지연된 할일',
    startDate: yesterday,
    endDate: yesterday,
  });
  const overdue = await overdueRes.json();

  const toCompleteRes = await createTodo(accessToken, {
    title: '완료할 할일',
    startDate: today,
    endDate: today,
  });
  const toComplete = await toCompleteRes.json();
  const patchRes = await fetch(`${baseUrl}/todos/${toComplete.id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ isCompleted: true }),
  });
  const completed = await patchRes.json();
  assert.strictEqual(completed.status, 'COMPLETED');

  async function idsForStatus(status) {
    const res = await fetch(`${baseUrl}/todos?status=${status}`, {
      headers: authHeaders(accessToken),
    });
    const body = await res.json();
    return body.items.map((t) => t.id);
  }

  assert.deepStrictEqual(await idsForStatus('NOT_STARTED'), [notStarted.id]);
  assert.deepStrictEqual(await idsForStatus('IN_PROGRESS'), [inProgress.id]);
  assert.deepStrictEqual(await idsForStatus('OVERDUE'), [overdue.id]);
  assert.deepStrictEqual(await idsForStatus('COMPLETED'), [completed.id]);
});

test('GET /todos respects pagination', async () => {
  const { accessToken } = await signupAndLogin();
  await createTodo(accessToken, { title: '할일1', startDate: today, endDate: today });
  await createTodo(accessToken, { title: '할일2', startDate: today, endDate: today });

  const page1Res = await fetch(`${baseUrl}/todos?limit=1&page=1`, {
    headers: authHeaders(accessToken),
  });
  const page1 = await page1Res.json();
  const page2Res = await fetch(`${baseUrl}/todos?limit=1&page=2`, {
    headers: authHeaders(accessToken),
  });
  const page2 = await page2Res.json();

  assert.strictEqual(page1.items.length, 1);
  assert.strictEqual(page2.items.length, 1);
  assert.notStrictEqual(page1.items[0].id, page2.items[0].id);
  assert.ok(page1.total >= 2);
});

test('GET /todos fails with 400 for invalid status value', async () => {
  const { accessToken } = await signupAndLogin();
  const res = await fetch(`${baseUrl}/todos?status=INVALID_VALUE`, {
    headers: authHeaders(accessToken),
  });
  assert.strictEqual(res.status, 400);
});

test('GET /todos fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/todos`);
  assert.strictEqual(res.status, 401);
});

test('PATCH /todos/:id fails with 404 when updating another user todo', async () => {
  const userA = await signupAndLogin();
  const userB = await signupAndLogin();
  const createRes = await createTodo(userA.accessToken, {
    title: '할일',
    startDate: today,
    endDate: today,
  });
  const created = await createRes.json();

  const res = await fetch(`${baseUrl}/todos/${created.id}`, {
    method: 'PATCH',
    headers: authHeaders(userB.accessToken),
    body: JSON.stringify({ title: '변경' }),
  });
  assert.strictEqual(res.status, 404);
});

test('PATCH /todos/:id fails with 400 when merged startDate is after endDate', async () => {
  const { accessToken } = await signupAndLogin();
  const createRes = await createTodo(accessToken, {
    title: '할일',
    startDate: today,
    endDate: today,
  });
  const created = await createRes.json();

  const res = await fetch(`${baseUrl}/todos/${created.id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ startDate: tomorrow }),
  });
  assert.strictEqual(res.status, 400);
});

test('PATCH /todos/:id toggles isCompleted and recomputes status', async () => {
  const { accessToken } = await signupAndLogin();
  const createRes = await createTodo(accessToken, {
    title: '할일',
    startDate: yesterday,
    endDate: tomorrow,
  });
  const created = await createRes.json();

  const completeRes = await fetch(`${baseUrl}/todos/${created.id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ isCompleted: true }),
  });
  const completed = await completeRes.json();
  assert.strictEqual(completeRes.status, 200);
  assert.notStrictEqual(completed.completedAt, null);
  assert.strictEqual(completed.status, 'COMPLETED');

  const reopenRes = await fetch(`${baseUrl}/todos/${created.id}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ isCompleted: false }),
  });
  const reopened = await reopenRes.json();
  assert.strictEqual(reopenRes.status, 200);
  assert.strictEqual(reopened.completedAt, null);
  assert.strictEqual(reopened.status, 'IN_PROGRESS');
});

test('DELETE /todos/:id fails with 401 without auth', async () => {
  const res = await fetch(`${baseUrl}/todos/00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
  });
  assert.strictEqual(res.status, 401);
});

test('DELETE /todos/:id fails with 404 for another user todo, then succeeds for owner', async () => {
  const userA = await signupAndLogin();
  const userB = await signupAndLogin();
  const createRes = await createTodo(userA.accessToken, {
    title: '할일',
    startDate: today,
    endDate: today,
  });
  const created = await createRes.json();

  const forbiddenRes = await fetch(`${baseUrl}/todos/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(userB.accessToken),
  });
  assert.strictEqual(forbiddenRes.status, 404);

  const okRes = await fetch(`${baseUrl}/todos/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(userA.accessToken),
  });
  assert.strictEqual(okRes.status, 204);

  const listRes = await fetch(`${baseUrl}/todos`, {
    headers: authHeaders(userA.accessToken),
  });
  const list = await listRes.json();
  assert.ok(!list.items.some((t) => t.id === created.id));
});

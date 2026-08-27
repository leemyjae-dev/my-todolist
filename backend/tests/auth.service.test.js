require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const pool = require('../src/db/pool');
const { signup, login, refreshAccessToken } = require('../src/modules/auth/auth.service');

const emails = [];
function randomEmail() {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  emails.push(email);
  return email;
}

test.after(async () => {
  if (emails.length > 0) {
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [emails]);
  }
});

test('signup creates a user without password field and a default category', async () => {
  const email = randomEmail();
  const user = await signup({ email, password: 'password123', name: '홍길동' });

  assert.strictEqual(user.email, email);
  assert.strictEqual(user.name, '홍길동');
  assert.ok(user.id);
  assert.strictEqual(user.password, undefined);

  const { rows } = await pool.query(
    'SELECT is_default FROM categories WHERE user_id = $1',
    [user.id]
  );
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].is_default, true);
});

test('signup rejects duplicate email with 409 EMAIL_TAKEN', async () => {
  const email = randomEmail();
  await signup({ email, password: 'password123', name: '홍길동' });

  await assert.rejects(
    () => signup({ email, password: 'password123', name: '홍길동' }),
    (err) => {
      assert.strictEqual(err.status, 409);
      assert.strictEqual(err.code, 'EMAIL_TAKEN');
      return true;
    }
  );
});

test('signup stores password as bcrypt hash, not plaintext', async () => {
  const email = randomEmail();
  const password = 'password123';
  await signup({ email, password, name: '홍길동' });

  const { rows } = await pool.query('SELECT password FROM users WHERE email = $1', [email]);
  assert.strictEqual(rows.length, 1);
  assert.notStrictEqual(rows[0].password, password);
  assert.ok(rows[0].password.startsWith('$2b$'));
});

test('login succeeds and returns accessToken/refreshToken/user', async () => {
  const email = randomEmail();
  const password = 'password123';
  await signup({ email, password, name: '홍길동' });

  const result = await login({ email, password });
  assert.strictEqual(typeof result.accessToken, 'string');
  assert.strictEqual(typeof result.refreshToken, 'string');
  assert.strictEqual(result.user.email, email);
});

test('login fails with wrong password: 401 INVALID_CREDENTIALS', async () => {
  const email = randomEmail();
  await signup({ email, password: 'password123', name: '홍길동' });

  await assert.rejects(
    () => login({ email, password: 'wrongpassword' }),
    (err) => {
      assert.strictEqual(err.status, 401);
      assert.strictEqual(err.code, 'INVALID_CREDENTIALS');
      return true;
    }
  );
});

test('login fails with unknown email: 401 INVALID_CREDENTIALS', async () => {
  await assert.rejects(
    () => login({ email: randomEmail(), password: 'password123' }),
    (err) => {
      assert.strictEqual(err.status, 401);
      assert.strictEqual(err.code, 'INVALID_CREDENTIALS');
      return true;
    }
  );
});

test('refreshAccessToken succeeds with a valid refreshToken', async () => {
  const email = randomEmail();
  const password = 'password123';
  await signup({ email, password, name: '홍길동' });
  const { refreshToken } = await login({ email, password });

  const result = await refreshAccessToken(refreshToken);
  assert.strictEqual(typeof result.accessToken, 'string');
});

test('refreshAccessToken fails with invalid token: 401 INVALID_REFRESH_TOKEN', async () => {
  await assert.rejects(
    () => refreshAccessToken('not-a-real-token'),
    (err) => {
      assert.strictEqual(err.status, 401);
      assert.strictEqual(err.code, 'INVALID_REFRESH_TOKEN');
      return true;
    }
  );
});

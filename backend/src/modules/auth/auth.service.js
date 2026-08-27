const bcrypt = require('bcrypt');
const pool = require('../../db/pool');
const { createUser, findUserByEmail } = require('../../db/queries/user.queries');
const { createDefaultCategory } = require('../../db/queries/category.queries');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../shared/jwt');

async function signup({ email, password, name }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let user;
    try {
      const { rows } = await client.query(
        `INSERT INTO users(email, password, name) VALUES ($1,$2,$3)
         RETURNING id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
        [email, passwordHash, name]
      );
      user = rows[0];
    } catch (err) {
      if (err.code === '23505') { // BR-07: 이메일 고유
        const dup = new Error('이미 사용 중인 이메일입니다.');
        dup.status = 409;
        dup.code = 'EMAIL_TAKEN';
        throw dup;
      }
      throw err;
    }
    await createDefaultCategory(user.id, client); // BR-02
    await client.query('COMMIT');
    console.log('[auth] signup ok', email);
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function login({ email, password }) {
  const user = await findUserByEmail(email); // BR-01
  const match = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !match) {
    console.warn('[auth] login fail', email);
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  console.log('[auth] login ok', email);
  const payload = { sub: user.id };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt },
  };
}

async function refreshAccessToken(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    console.warn('[auth] refresh fail');
    const err = new Error('refresh token이 유효하지 않습니다.');
    err.status = 401;
    err.code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }
  console.log('[auth] refresh ok', decoded.sub);
  return { accessToken: signAccessToken({ sub: decoded.sub }) };
}

module.exports = { signup, login, refreshAccessToken };

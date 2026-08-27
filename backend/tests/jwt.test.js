require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/shared/jwt');

test('access token can be signed and verified', () => {
  const token = signAccessToken({ sub: 'u1' });
  const decoded = verifyAccessToken(token);
  assert.strictEqual(decoded.sub, 'u1');
  assert.ok(decoded.exp > decoded.iat);
});

test('refresh token can be signed and verified', () => {
  const token = signRefreshToken({ sub: 'u1' });
  const decoded = verifyRefreshToken(token);
  assert.strictEqual(decoded.sub, 'u1');
  assert.ok(decoded.exp > decoded.iat);
});

test('verifyAccessToken throws on tampered token', () => {
  const token = signAccessToken({ sub: 'u1' });
  assert.throws(() => verifyAccessToken(`${token}x`));
});

test('verifyAccessToken throws on token signed with wrong secret', () => {
  const jwt = require('jsonwebtoken');
  const bogus = jwt.sign({ sub: 'u1' }, 'wrong-secret', { expiresIn: '15m' });
  assert.throws(() => verifyAccessToken(bogus));
});

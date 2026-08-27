require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const errorHandler = require('../src/middlewares/errorHandler');

let server;
let baseUrl;

test.before(async () => {
  const app = express();
  app.get('/boom', (req, res, next) => {
    const err = new Error('테스트 에러');
    err.status = 400;
    err.code = 'BAD_REQUEST';
    next(err);
  });
  app.get('/boom-default', (req, res, next) => {
    next(new Error('그냥 에러'));
  });
  app.use(errorHandler);
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

test('error with status/code passes through as-is', async () => {
  const res = await fetch(`${baseUrl}/boom`);
  const body = await res.json();
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(body, { error: { code: 'BAD_REQUEST', message: '테스트 에러' } });
});

test('error without status/code defaults to 500/INTERNAL_ERROR', async () => {
  const res = await fetch(`${baseUrl}/boom-default`);
  const body = await res.json();
  assert.strictEqual(res.status, 500);
  assert.strictEqual(body.error.code, 'INTERNAL_ERROR');
  assert.strictEqual(body.error.message, '그냥 에러');
});

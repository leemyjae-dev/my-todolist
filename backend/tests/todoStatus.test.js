const test = require('node:test');
const assert = require('node:assert');
const { computeStatus } = require('../src/shared/todoStatus');

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

test('isCompleted true with future dates returns COMPLETED', () => {
  assert.strictEqual(
    computeStatus({ startDate: tomorrow, endDate: tomorrow, isCompleted: true }),
    'COMPLETED'
  );
});

test('isCompleted true with past dates returns COMPLETED', () => {
  assert.strictEqual(
    computeStatus({ startDate: yesterday, endDate: yesterday, isCompleted: true }),
    'COMPLETED'
  );
});

test('startDate in future returns NOT_STARTED', () => {
  assert.strictEqual(
    computeStatus({ startDate: tomorrow, endDate: tomorrow, isCompleted: false }),
    'NOT_STARTED'
  );
});

test('startDate today, endDate today returns IN_PROGRESS', () => {
  assert.strictEqual(
    computeStatus({ startDate: today, endDate: today, isCompleted: false }),
    'IN_PROGRESS'
  );
});

test('startDate yesterday, endDate today returns IN_PROGRESS', () => {
  assert.strictEqual(
    computeStatus({ startDate: yesterday, endDate: today, isCompleted: false }),
    'IN_PROGRESS'
  );
});

test('startDate yesterday, endDate yesterday returns OVERDUE', () => {
  assert.strictEqual(
    computeStatus({ startDate: yesterday, endDate: yesterday, isCompleted: false }),
    'OVERDUE'
  );
});

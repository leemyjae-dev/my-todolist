const test = require('node:test');
const assert = require('node:assert');
const { start } = require('../src/server');

let server;
let baseUrl;

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
});

test('GET /api-docs is available when NODE_ENV is not production', async () => {
  assert.notStrictEqual(process.env.NODE_ENV, 'production');
  const res = await fetch(`${baseUrl}/api-docs/`);
  assert.strictEqual(res.status, 200);
});

test('GET /api-docs is disabled when NODE_ENV is production', async () => {
  const { execFileSync } = require('node:child_process');
  const script = `
    process.env.NODE_ENV = 'production';
    const app = require('./src/app');
    const server = app.listen(0, () => {
      const { port } = server.address();
      fetch('http://127.0.0.1:' + port + '/api-docs/')
        .then((res) => { console.log(res.status); server.close(() => process.exit(0)); })
        .catch((err) => { console.error(err); server.close(() => process.exit(1)); });
    });
  `;
  const output = execFileSync(process.execPath, ['-e', script], { cwd: __dirname + '/..' }).toString().trim();
  const lastLine = output.split('\n').pop();
  assert.strictEqual(lastLine, '404');
});

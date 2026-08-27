require('dotenv').config();

const app = require('./app');

function start(port = process.env.PORT || 3000) {
  return app.listen(port);
}

module.exports = { start };

if (require.main === module) {
  start();
}

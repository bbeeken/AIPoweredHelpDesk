const assert = require('assert');
const http = require('http');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/user/1' }, res => {
    let data = '';
    res.on('data', c => (data += c));
    res.on('end', () => {
      const stats = JSON.parse(data);
      assert.strictEqual(stats.userId, 1);
      assert.ok(typeof stats.assets === 'number');
      assert.ok(typeof stats.tickets.open === 'number');
      server.close(() => console.log('User stats test passed'));
    });
  });
});

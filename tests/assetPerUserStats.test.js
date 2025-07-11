const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/assets-per-user' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const arr = JSON.parse(data);
      assert.ok(Array.isArray(arr));
      const u1 = arr.find(e => e.userId === 1);
      assert.ok(u1);
      assert.ok(typeof u1.count === 'number');
      server.close(() => console.log('Assets per user stats test passed'));
    });
  });
});

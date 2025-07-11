const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/sw.js' }, res => {
    assert.strictEqual(res.statusCode, 200);
    http.get({ port, path: '/manifest.json' }, res2 => {
      assert.strictEqual(res2.statusCode, 200);
      server.close(() => console.log('Service worker files test passed'));
    });
  });
});

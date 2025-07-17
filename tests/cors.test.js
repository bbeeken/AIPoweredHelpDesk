const http = require('http');
const assert = require('assert');
process.env.CORS_ORIGIN = 'http://test.example';
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/health' }, res => {
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://test.example');
    const req = http.request({ port, path: '/tickets', method: 'OPTIONS' }, res2 => {
      assert.strictEqual(res2.statusCode, 204);
      assert.strictEqual(res2.headers['access-control-allow-origin'], 'http://test.example');
      server.close(() => console.log('CORS test passed'));
    });
    req.end();
  });
});

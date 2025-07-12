const assert = require('assert');
const http = require('http');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const req = http.get({ port, path: '/events' }, res => {
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], 'text/event-stream');
    res.destroy();
    server.close(() => console.log('Events endpoint test passed'));
  });
  req.on('error', err => {
    server.close(() => { throw err; });
  });
});

const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const esReq = http.get({ port, path: '/assist' }, res => {
    assert.strictEqual(res.statusCode, 200);
    res.setEncoding('utf8');
    let buf = '';
    let posted = false;
    res.on('data', chunk => {
      buf += chunk;
      if (!posted && buf.includes('connected')) {
        const post = http.request(
          { port, path: '/assist', method: 'POST', headers: { 'Content-Type': 'application/json' } },
          () => {}
        );
        post.end(JSON.stringify({ text: 'password help' }));
        posted = true;
        buf = '';
        return;
      }
      if (buf.includes('\n\n')) {
        assert.ok(buf.includes('Reset password'));
        res.destroy();
        server.close(() => console.log('Assist stream test passed'));
      }
    });
  });
});

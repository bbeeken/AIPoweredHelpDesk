const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const req = http.request({ port, path: '/api/analytics/export', method: 'POST', headers: {'Content-Type':'application/json'} }, res => {
    assert.strictEqual(res.statusCode, 200);
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => {
      const buf = Buffer.concat(chunks);
      assert.ok(buf.length > 0);
      assert.ok(/text\/csv/.test(res.headers['content-type']));
      assert.ok(/attachment/.test(res.headers['content-disposition']));
      server.close(() => console.log('Analytics export route test passed'));
    });
  });
  req.end(JSON.stringify({ format: 'csv' }));
});

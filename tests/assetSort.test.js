const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/assets?sortBy=name' }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const assets = JSON.parse(body);
      assert.ok(Array.isArray(assets));
      assert.strictEqual(assets[0].name, 'Headset');
      server.close(() => console.log('Asset sorting test passed'));
    });
  });
});

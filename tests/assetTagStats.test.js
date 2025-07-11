const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const create = http.request({ port, path: '/assets', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      http.get({ port, path: '/stats/asset-tags' }, gres => {
        let out = '';
        gres.on('data', d => out += d);
        gres.on('end', () => {
          const stats = JSON.parse(out);
          assert.ok(stats.peripheral >= 1);
          server.close(() => console.log('Asset tag stats test passed'));
        });
      });
    });
  });
  create.end(JSON.stringify({ name: 'Monitor', tags: ['peripheral'] }));
});

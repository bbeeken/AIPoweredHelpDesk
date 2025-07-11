const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const create = http.request({ port, path: '/assets', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const asset = JSON.parse(body);
      http.get({ port, path: '/assets/search?q=' + encodeURIComponent('Proj') }, res2 => {
        let out = '';
        res2.on('data', d => out += d);
        res2.on('end', () => {
          const assets = JSON.parse(out);
          assert.ok(assets.some(a => a.id === asset.id));
          server.close(() => console.log('Asset search test passed'));
        });
      });
    });
  });
  create.end(JSON.stringify({ name: 'Projector', assignedTo: 1 }));
});

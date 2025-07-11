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
      http.get({ port, path: '/assets?assignedTo=' + asset.assignedTo }, res2 => {
        let data = '';
        res2.on('data', d => data += d);
        res2.on('end', () => {
          const assets = JSON.parse(data);
          assert.ok(assets.some(a => a.id === asset.id));
          server.close(() => console.log('Asset assigned filter test passed'));
        });
      });
    });
  });
  create.end(JSON.stringify({ name: 'Scanner', assignedTo: 2 }));
});

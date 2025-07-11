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
      const id = asset.id;
      const add = http.request({ port, path: `/assets/${id}/maintenance`, method: 'POST', headers: { 'Content-Type': 'application/json' } }, mres => {
        mres.resume();
        mres.on('end', () => {
          http.get({ port, path: '/stats/maintenance-cost' }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const stats = JSON.parse(out);
              assert.ok(stats[id] === 50);
              server.close(() => console.log('Maintenance cost stats test passed'));
            });
          });
        });
      });
      add.end(JSON.stringify({ description: 'Service', cost: 50 }));
    });
  });
  create.end(JSON.stringify({ name: 'Router', assignedTo: 1 }));
});


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
      const dep = http.request({ port, path: `/assets/${id}/depreciate`, method: 'POST' }, dres => {
        dres.resume();
        dres.on('end', () => {
          http.get({ port, path: '/assets/depreciated' }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const arr = JSON.parse(out);
              assert.ok(Array.isArray(arr));
              assert.ok(arr.some(a => a.id === id));
              server.close(() => console.log('Depreciated listing test passed'));
            });
          });
        });
      });
      dep.end();
    });
  });
  create.end(JSON.stringify({ name: 'Router', assignedTo: 1 }));
});

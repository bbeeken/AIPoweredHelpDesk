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
        let mb = '';
        mres.on('data', d => mb += d);
        mres.on('end', () => {
          const record = JSON.parse(mb);
          assert.ok(record.description === 'Replaced battery');
          http.get({ port, path: `/assets/${id}/maintenance` }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const arr = JSON.parse(out);
              assert.ok(Array.isArray(arr));
              assert.ok(arr.length === 1);
              assert.ok(arr[0].description === 'Replaced battery');
              server.close(() => console.log('Maintenance test passed'));
            });
          });
        });
      });
      add.end(JSON.stringify({ description: 'Replaced battery', cost: 100 }));
    });
  });
  create.end(JSON.stringify({ name: 'Printer', assignedTo: 1 }));
});

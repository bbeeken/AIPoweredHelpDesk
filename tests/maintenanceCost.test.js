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
          const add2 = http.request({ port, path: `/assets/${id}/maintenance`, method: 'POST', headers: { 'Content-Type': 'application/json' } }, mres2 => {
            mres2.resume();
            mres2.on('end', () => {
              http.get({ port, path: `/assets/${id}/maintenance/total-cost` }, gres => {
                let out = '';
                gres.on('data', d => out += d);
                gres.on('end', () => {
                  const obj = JSON.parse(out);
                  assert.ok(obj.total === 30);
                  server.close(() => console.log('Maintenance cost test passed'));
                });
              });
            });
          });
          add2.end(JSON.stringify({ description: 'Repair', cost: 20 }));
        });
      });
      add.end(JSON.stringify({ description: 'Checkup', cost: 10 }));
    });
  });
  create.end(JSON.stringify({ name: 'Speaker', assignedTo: 1 }));
});

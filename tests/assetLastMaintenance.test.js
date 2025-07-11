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
      const add1 = http.request({ port, path: `/assets/${id}/maintenance`, method: 'POST', headers: { 'Content-Type': 'application/json' } }, r1 => {
        r1.resume();
        r1.on('end', () => {
          const add2 = http.request({ port, path: `/assets/${id}/maintenance`, method: 'POST', headers: { 'Content-Type': 'application/json' } }, r2 => {
            r2.resume();
            r2.on('end', () => {
              http.get({ port, path: `/assets/${id}/maintenance/last` }, gres => {
                let out = '';
                gres.on('data', d => out += d);
                gres.on('end', () => {
                  const rec = JSON.parse(out);
                  assert.ok(rec.description === 'Repair');
                  server.close(() => console.log('Asset last maintenance test passed'));
                });
              });
            });
          });
          add2.end(JSON.stringify({ description: 'Repair', cost: 25 }));
        });
      });
      add1.end(JSON.stringify({ description: 'Inspection', cost: 10 }));
    });
  });
  create.end(JSON.stringify({ name: 'Camera', assignedTo: 1 }));
});

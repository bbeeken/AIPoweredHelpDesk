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
      const retire = http.request({ port, path: `/assets/${id}/retire`, method: 'POST' }, rres => {
        rres.resume();
        rres.on('end', () => {
          http.get({ port, path: '/assets/retired' }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const arr = JSON.parse(out);
              assert.ok(Array.isArray(arr));
              assert.ok(arr.some(a => a.id === id));
              http.get({ port, path: `/assets/${id}/history` }, hres => {
                let hist = '';
                hres.on('data', d => hist += d);
                hres.on('end', () => {
                  const entries = JSON.parse(hist);
                  const entry = entries.find(e => e.action === 'retired');
                  assert.ok(entry && entry.by === 1);
                  server.close(() => console.log('Asset retire test passed'));
                });
              });
            });
          });
        });
      });
      retire.end();
    });
  });
  create.end(JSON.stringify({ name: 'Camera', assignedTo: 1 }));
});

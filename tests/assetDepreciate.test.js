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
      const req = http.request({ port, path: `/assets/${asset.id}/depreciate`, method: 'POST' }, dres => {
        let out = '';
        dres.on('data', d => out += d);
        dres.on('end', () => {
          const updated = JSON.parse(out);
          assert.ok(updated.depreciationDate);
          http.get({ port, path: `/assets/${asset.id}/history` }, hres => {
            let hist = '';
            hres.on('data', d => hist += d);
            hres.on('end', () => {
              const arr = JSON.parse(hist);
              const entry = arr.find(e => e.action === 'depreciated');
              assert.ok(entry && entry.by === 1);
              server.close(() => console.log('Depreciate test passed'));
            });
          });
        });
      });
      req.end();
    });
  });
  create.end(JSON.stringify({ name: 'Monitor', assignedTo: 1 }));
});

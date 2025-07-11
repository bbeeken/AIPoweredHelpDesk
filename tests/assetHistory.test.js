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
      const patch = http.request({ port, path: `/assets/${id}`, method: 'PATCH', headers: { 'Content-Type': 'application/json' } }, pres => {
        pres.resume();
        pres.on('end', () => {
          http.get({ port, path: `/assets/${id}/history` }, hres => {
            let hist = '';
            hres.on('data', d => hist += d);
            hres.on('end', () => {
              const arr = JSON.parse(hist);
              assert.ok(Array.isArray(arr));
              assert.ok(arr.length === 1);
              server.close(() => console.log('History test passed'));
            });
          });
        });
      });
      patch.end(JSON.stringify({ assignedTo: 2 }));
    });
  });
  create.end(JSON.stringify({ name: 'Tablet', assignedTo: 1 }));
});

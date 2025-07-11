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
      const del = http.request({ port, path: `/assets/${asset.id}`, method: 'DELETE' }, dres => {
        dres.resume();
        dres.on('end', () => {
          http.get({ port, path: `/assets/${asset.id}` }, gres => {
            gres.resume();
            assert.strictEqual(gres.statusCode, 404);
            server.close(() => console.log('Asset delete test passed'));
          });
        });
      });
      del.end();
    });
  });
  create.end(JSON.stringify({ name: 'Temp', assignedTo: 1 }));
});

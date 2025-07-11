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
      const add = http.request({ port, path: `/assets/${id}/tags`, method: 'POST', headers: { 'Content-Type': 'application/json' } }, tres => {
        tres.resume();
        tres.on('end', () => {
          http.get({ port, path: `/assets/${id}/tags` }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const tags = JSON.parse(out);
              assert.ok(tags.includes('peripheral'));
              http.get({ port, path: '/assets?tag=peripheral' }, lres => {
                let list = '';
                lres.on('data', d => list += d);
                lres.on('end', () => {
                  const arr = JSON.parse(list);
                  assert.ok(arr.some(a => a.id === id));
                  const del = http.request({ port, path: `/assets/${id}/tags/peripheral`, method: 'DELETE' }, dres => {
                    dres.resume();
                    dres.on('end', () => {
                      http.get({ port, path: `/assets/${id}/tags` }, f => {
                        let fin = '';
                        f.on('data', x => fin += x);
                        f.on('end', () => {
                          const after = JSON.parse(fin);
                          assert.ok(!after.includes('peripheral'));
                          server.close(() => console.log('Asset tags test passed'));
                        });
                      });
                    });
                  });
                  del.end();
                });
              });
            });
          });
        });
      });
      add.end(JSON.stringify({ tag: 'peripheral' }));
    });
  });
  create.end(JSON.stringify({ name: 'Mouse', assignedTo: 1 }));
});

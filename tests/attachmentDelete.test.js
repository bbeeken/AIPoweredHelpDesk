const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const tid = 2353;
  // ensure attachment exists
  http.get({ port, path: `/tickets/${tid}/attachments` }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const list = JSON.parse(body);
      assert.ok(list.some(a => a.id === 1));
      const del = http.request({ port, path: `/tickets/${tid}/attachments/1`, method: 'DELETE' }, dres => {
        dres.resume();
        dres.on('end', () => {
          http.get({ port, path: `/tickets/${tid}/attachments` }, final => {
            let out = '';
            final.on('data', c => out += c);
            final.on('end', () => {
              const after = JSON.parse(out);
              assert.ok(!after.some(a => a.id === 1));
              server.close(() => console.log('Attachment delete test passed'));
            });
          });
        });
      });
      del.end();
    });
  });
});

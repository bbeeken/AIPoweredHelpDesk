const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const tid = 2353;
  // add a comment first
  const add = http.request({ port, path: `/tickets/${tid}/comments`, method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const comment = JSON.parse(body);
      const del = http.request({ port, path: `/tickets/${tid}/comments/${comment.id}`, method: 'DELETE' }, dres => {
        dres.resume();
        dres.on('end', () => {
          http.get({ port, path: `/tickets/${tid}/comments` }, gres => {
            let out = '';
            gres.on('data', c => out += c);
            gres.on('end', () => {
              const list = JSON.parse(out);
              assert.ok(!list.some(c => c.id === comment.id));
              server.close(() => console.log('Comment delete test passed'));
            });
          });
        });
      });
      del.end();
    });
  });
  add.end(JSON.stringify({ text: 'Temporary' }));
});

const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const tid = 2353;
  // add a comment first
  const add = http.request({
    port,
    path: `/tickets/${tid}/comments`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const comment = JSON.parse(body);
      // edit the comment
      const patch = http.request({
        port,
        path: `/tickets/${tid}/comments/${comment.id}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      }, pres => {
        let pb = '';
        pres.on('data', c => pb += c);
        pres.on('end', () => {
          const updated = JSON.parse(pb);
          assert.strictEqual(updated.text, 'Updated text');
          assert.ok(updated.edited, 'edited timestamp');
          // verify via listing
          http.get({ port, path: `/tickets/${tid}/comments` }, gres => {
            let out = '';
            gres.on('data', d => out += d);
            gres.on('end', () => {
              const list = JSON.parse(out);
              const stored = list.find(c => c.id === comment.id);
              assert.strictEqual(stored.text, 'Updated text');
              assert.ok(stored.edited);
              server.close(() => console.log('Comment edit test passed'));
            });
          });
        });
      });
      patch.end(JSON.stringify({ text: 'Updated text' }));
    });
  });
  add.end(JSON.stringify({ text: 'Original' }));
});

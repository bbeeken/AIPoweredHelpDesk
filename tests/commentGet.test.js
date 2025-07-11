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
      http.get({ port, path: `/tickets/${tid}/comments/${comment.id}` }, gres => {
        let data = '';
        gres.on('data', c => data += c);
        gres.on('end', () => {
          const fetched = JSON.parse(data);
          assert.strictEqual(fetched.id, comment.id);
          assert.strictEqual(fetched.text, 'Fetch me');
          server.close(() => console.log('Comment get test passed'));
        });
      });
    });
  });
  add.end(JSON.stringify({ text: 'Fetch me' }));
});

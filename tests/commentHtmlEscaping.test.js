const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const tid = 2353;
  const text = "<script>alert('x')</script> hello @Alice";
  const add = http.request(
    { port, path: `/tickets/${tid}/comments`, method: 'POST', headers: { 'Content-Type': 'application/json' } },
    res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const comment = JSON.parse(body);
        http.get({ port, path: `/tickets/${tid}/comments/${comment.id}` }, gres => {
          let data = '';
          gres.on('data', c => data += c);
          gres.on('end', () => {
            const fetched = JSON.parse(data);
            assert.ok(fetched.html.includes('&lt;script&gt;alert('));
            assert.ok(!fetched.html.includes('<script>'));
            server.close(() => console.log('Comment HTML escaping test passed'));
          });
        });
      });
    }
  );
  add.end(JSON.stringify({ text }));
});

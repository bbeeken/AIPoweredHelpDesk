const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const tid = 2353;
  const add = http.request({
    port,
    path: `/tickets/${tid}/comments`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    res.resume();
    res.on('end', () => {
      http.get({ port, path: '/stats/comments' }, gres => {
        let data = '';
        gres.on('data', d => data += d);
        gres.on('end', () => {
          const stats = JSON.parse(data);
          assert.ok(stats[tid] >= 1);
          server.close(() => console.log('Comments stats test passed'));
        });
      });
    });
  });
  add.end(JSON.stringify({ text: 'Stat comment' }));
});

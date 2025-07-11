const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/overdue' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const arr = JSON.parse(data);
      assert.ok(Array.isArray(arr));
      const entry = arr.find(r => r.userId === 1);
      assert.ok(entry && typeof entry.count === 'number' && entry.count >= 2);
      server.close(() => console.log('Overdue stats test passed'));
    });
  });
});

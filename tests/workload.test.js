const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/workload' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const arr = JSON.parse(data);
      assert.ok(Array.isArray(arr));
      const entry = arr.find(w => w.userId === 1);
      assert.ok(entry);
      assert.ok(typeof entry.open === 'number');
      server.close(() => console.log('Workload stats test passed'));
    });
  });
});

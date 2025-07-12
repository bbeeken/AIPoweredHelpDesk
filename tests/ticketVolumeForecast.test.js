const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/forecast?days=5' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const obj = JSON.parse(data);
      assert.ok(typeof obj.forecast === 'number');
      assert.ok(obj.forecast > 0);
      server.close(() => console.log('Ticket volume forecast test passed'));
    });
  });
});

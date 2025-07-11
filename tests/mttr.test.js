const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/mttr' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const obj = JSON.parse(data);
      assert.ok(typeof obj.mttr === 'number');
      assert.ok(obj.mttr > 0);
      server.close(() => console.log('MTTR test passed'));
    });
  });
});

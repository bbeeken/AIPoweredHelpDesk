const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/tags' }, res => {
    let data = '';
    res.on('data', d => (data += d));
    res.on('end', () => {
      const obj = JSON.parse(data);
      assert.ok(obj.password >= 1);
      assert.ok(obj.configuration >= 1);
      server.close(() => console.log('Tag stats test passed'));
    });
  });
});

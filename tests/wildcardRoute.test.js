const http = require('http');
const assert = require('assert');
const express = require('../express');

const app = express();
app.get('*', (req, res) => {
  res.end('wild');
});

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/any/random/path' }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(data, 'wild');
      server.close(() => console.log('Wildcard route test passed'));
    });
  });
});

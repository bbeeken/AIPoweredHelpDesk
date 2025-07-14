const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/stats/trends?days=5' }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const obj = JSON.parse(data);
      assert.ok(Array.isArray(obj.series));
      assert.ok(obj.series.length === 5);
      assert.ok(typeof obj.forecast === 'number');
      assert.ok(Array.isArray(obj.anomalies));
      server.close(() => console.log('Trends endpoint test passed'));
    });
  });
});

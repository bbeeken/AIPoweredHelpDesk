const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/api/analytics/overview' }, res => {
    let data = '';
    res.on('data', d => (data += d));
    res.on('end', () => {
      const obj = JSON.parse(data);
      assert.ok(obj.priorities && typeof obj.priorities === 'object');
      assert.ok(Array.isArray(obj.teamPerformance));
      http.get({ port, path: '/api/analytics/timeseries?days=3' }, res2 => {
        let d2 = '';
        res2.on('data', c => (d2 += c));
        res2.on('end', () => {
          const arr = JSON.parse(d2);
          assert.ok(Array.isArray(arr));
          assert.ok(arr.length === 3);
          server.close(() => console.log('Analytics endpoints test passed'));
        });
      });
    });
  });
});

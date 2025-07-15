const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const req = http.request({ port, path: '/ai/sentiment', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const obj = JSON.parse(data);
      assert.ok(obj.sentiment);
      server.close(() => console.log('Sentiment analysis test passed'));
    });
  });
  req.end(JSON.stringify({ text: 'I love this product!' }));
});

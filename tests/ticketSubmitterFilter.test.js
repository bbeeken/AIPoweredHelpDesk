const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  http.get({ port, path: '/tickets?submitter=2' }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const tickets = JSON.parse(data);
      assert.ok(Array.isArray(tickets));
      assert.ok(tickets.length > 0);
      assert.ok(tickets.every(t => t.submitterId === 2));
      server.close(() => console.log('Submitter query test passed'));
    });
  });
});

const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const req = http.request({
    port,
    path: '/sentiment',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const result = JSON.parse(data);
      assert.strictEqual(result.label, 'positive');
      createTicket();
    });
  });
  req.end(JSON.stringify({ text: 'I love this product' }));

  function createTicket() {
    const create = http.request({
      port,
      path: '/tickets',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const ticket = JSON.parse(body);
        assert.ok(ticket.sentiment);
        assert.strictEqual(ticket.sentiment.label, 'positive');
        addComment(ticket.id);
      });
    });
    create.end(JSON.stringify({ question: 'Great service!' }));
  }

  function addComment(id) {
    const commentReq = http.request({
      port,
      path: `/tickets/${id}/comments`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        const comment = JSON.parse(out);
        assert.ok(comment.sentiment);
        assert.strictEqual(comment.sentiment.label, 'negative');
        server.close(() => console.log('Sentiment analysis test passed'));
      });
    });
    commentReq.end(JSON.stringify({ text: 'terrible experience' }));
  }
});

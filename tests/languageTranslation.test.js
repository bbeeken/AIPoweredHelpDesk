const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
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
      assert.strictEqual(ticket.language, 'es');
      assert.strictEqual(ticket.question, 'How do I reset my password?');
      assert.strictEqual(ticket.originalQuestion, '¿Cómo restablezco mi contraseña?');
      server.close(() => console.log('Language translation test passed'));
    });
  });
  create.end(JSON.stringify({ question: '¿Cómo restablezco mi contraseña?' }));
});

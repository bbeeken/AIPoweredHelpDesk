const http = require('http');
const assert = require('assert');
const app = require('../server');

const server = app.listen(0, () => {
  const port = server.address().port;
  const text = 'Hola, necesito ayuda con mi cuenta';
  const create = http.request({
    port,
    path: '/tickets',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      const ticket = JSON.parse(body);
      assert.strictEqual(ticket.language, 'es');
      assert.strictEqual(ticket.originalQuestion.startsWith('Hola'), true);
      assert.notStrictEqual(ticket.question, ticket.originalQuestion);
      server.close(() => console.log('Translation test passed'));
    });
  });
  create.end(JSON.stringify({ question: text }));
});

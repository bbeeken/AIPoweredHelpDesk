const assert = require('assert');
const http = require('http');
const app = require('../server');

assert.ok(app, 'Express app should be defined');

// Basic integration tests
const server = app.listen(0, () => {
  const port = server.address().port;

  // check dashboard
  http.get({ port, path: '/dashboard' }, res => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(data);
      assert.ok(json.message);

      // check ticket filter
      http.get({ port, path: '/tickets?status=open' }, res2 => {
        let body = '';
        res2.on('data', c => (body += c));
        res2.on('end', () => {
          const tickets = JSON.parse(body);
          assert.ok(Array.isArray(tickets));
          assert.ok(tickets.every(t => t.status === 'open'));

          // check attachments listing
          const tid = 2353;
          http.get({ port, path: `/tickets/${tid}/attachments` }, res3 => {
            let a = '';
            res3.on('data', ch => (a += ch));
            res3.on('end', () => {
              const attachments = JSON.parse(a);
              assert.ok(Array.isArray(attachments));

              http.get({ port, path: `/tickets/${tid}/comments` }, resC => {
                let cm = '';
                resC.on('data', d => cm += d);
                resC.on('end', () => {
                  const comments = JSON.parse(cm);
                  assert.ok(Array.isArray(comments));

                  // add and verify tag
                  const post = http.request({ port, path: `/tickets/${tid}/tags`, method: 'POST', headers: {'Content-Type':'application/json'} }, res4 => {
                    res4.resume();
                    res4.on('end', () => {
                      http.get({ port, path: `/tickets/${tid}/tags` }, res5 => {
                    let tg = '';
                    res5.on('data', c => tg += c);
                    res5.on('end', () => {
                      const tags = JSON.parse(tg);
                      assert.ok(tags.includes('urgent'));

                      // search endpoint
                      http.get({ port, path: '/tickets/search?q=password' }, res6 => {
                        let s = '';
                        res6.on('data', cc => s += cc);
                        res6.on('end', () => {
                          const results = JSON.parse(s);
                          assert.ok(results.length >= 1);

                          // assets API
                          http.get({ port, path: '/assets' }, resA => {
                            let ad = '';
                            resA.on('data', d => ad += d);
                            resA.on('end', () => {
                              const assets = JSON.parse(ad);
                              assert.ok(Array.isArray(assets));

                              const req = http.request({ port, path: '/assets', method: 'POST', headers: {'Content-Type':'application/json'} }, resB => {
                                let pb = '';
                                resB.on('data', c => pb += c);
                                resB.on('end', () => {
                                  const asset = JSON.parse(pb);
                                  assert.ok(asset.name === 'Phone');

                                  http.get({ port, path: `/assets/${asset.id}` }, resC => {
                                    let g = '';
                                    resC.on('data', cc => g += cc);
                                    resC.on('end', () => {
                                      const retrieved = JSON.parse(g);
                                      assert.strictEqual(retrieved.id, asset.id);
                                      server.close(() => console.log('All tests passed'));
                                    });
                                  });
                                });
                              });
                              req.end(JSON.stringify({ name: 'Phone', assignedTo: 1 }));
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
              post.end(JSON.stringify({ tag: 'urgent' }));
                });
              });
            });
          });
        });
      });
    });
  }).on('error', err => {
    server.close(() => { throw err; });
  });
});

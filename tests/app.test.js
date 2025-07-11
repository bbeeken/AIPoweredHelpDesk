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

                      http.get({ port, path: `/tickets/${tid}/history` }, resHist => {
                        let h = '';
                        resHist.on('data', c => h += c);
                        resHist.on('end', () => {
                          const history = JSON.parse(h);
                          assert.ok(Array.isArray(history));
                          assert.ok(history.length >= 1);

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

                                      http.get({ port, path: `/assets/assigned/1` }, resAA => {
                                        let aa = '';
                                        resAA.on('data', d => aa += d);
                                        resAA.on('end', () => {
                                          const userAssets = JSON.parse(aa);
                                          assert.ok(Array.isArray(userAssets));
                                          assert.ok(userAssets.some(a => a.id === asset.id));

                                          // stats endpoint
                                          http.get({ port, path: '/stats' }, resStats => {
                                            let st = '';
                                            resStats.on('data', d => st += d);
                                            resStats.on('end', () => {
                                              const stats = JSON.parse(st);
                                              assert.ok(stats.tickets.open >= 0);

                                              http.get({ port, path: '/tickets/assigned/1' }, resAssign => {
                                                let at = '';
                                                resAssign.on('data', d => at += d);
                                                resAssign.on('end', () => {
                                                  const assigned = JSON.parse(at);
                                                  assert.ok(Array.isArray(assigned));
                                                  server.close(() => console.log('All tests passed'));
                                                });
                                              });
                                            });
                                          });
                                        });
                                      });
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
});
});

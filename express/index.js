const http = require('http');
const fs = require('fs');
const path = require('path');

function compilePath(p) {
  const keys = [];
  const regexStr = '^' + p.replace(/\/?:(\w+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '$';
  return { regexp: new RegExp(regexStr), keys };
}

function createApp() {
  const routes = [];
  const middleware = [];
  const app = (req, res) => handler(req, res);

  function handler(req, res) {
    res.status = code => { res.statusCode = code; return res; };
    res.json = obj => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
    const url = new URL(req.url, 'http://localhost');
    req.path = url.pathname;
    req.query = Object.fromEntries(url.searchParams.entries());
    req.params = {};

    let i = 0;
    function run() {
      if (i < middleware.length) {
        middleware[i++](req, res, run);
      } else {
        handleRoutes();
      }
    }

    function handleRoutes() {
      for (const r of routes) {
        if (r.method === req.method) {
          const m = r.regexp.exec(req.path);
          if (m) {
            r.keys.forEach((k, idx) => { req.params[k] = decodeURIComponent(m[idx + 1]); });
            return r.handler(req, res);
          }
        }
      }
      res.statusCode = 404;
      res.end('Not Found');
    }

    run();
  }

  app.use = fn => middleware.push(fn);
  ['GET','POST','PATCH','DELETE'].forEach(method => {
    app[method.toLowerCase()] = (p, h) => {
      const {regexp, keys} = compilePath(p);
      routes.push({method, regexp, keys, handler: h});
    };
  });

  app.listen = (port, cb) => {
    const server = http.createServer(app);
    // Allow longer keep-alive so tests don't hit the default 5s timeout
    server.keepAliveTimeout = 30000; // 30 seconds
    server.headersTimeout = 32000;
    return server.listen(port, cb);
  };
  return app;
}

createApp.static = dir => (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const file = path.join(dir, req.path.replace(/^\//, ''));
  fs.stat(file, (err, stat) => {
    if (!err && stat.isFile()) {
      fs.createReadStream(file).pipe(res);
    } else {
      next();
    }
  });
};

module.exports = createApp;

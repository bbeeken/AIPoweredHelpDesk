module.exports.json = function() {
  return function(req, res, next) {
    if ((req.headers['content-type'] || '').includes('application/json')) {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        if (data.length > 0) {
          try { req.body = JSON.parse(data); }
          catch { req.body = {}; }
        } else {
          req.body = {};
        }
        next();
      });
    } else {
      req.body = {};
      next();
    }
  };
};

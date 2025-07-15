const http = require('http');


function wrap(fn) {
  return function (options, ...args) {
    if (typeof options === 'string') options = new URL(options);
    else options = { ...options };
    options.headers = { ...(options.headers || {}) };
    return fn.call(http, options, ...args);
  };
}

http.request = wrap(http.request);
http.get = wrap(http.get);

module.exports = {};

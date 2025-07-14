const http = require('http');
const auth = require('../utils/authService');

const { token } = auth.authenticate('Brian', 'password1');
const authHeader = { Authorization: `Bearer ${token}` };

function wrap(fn) {
  return function (options, ...args) {
    if (typeof options === 'string') options = new URL(options);
    else options = { ...options };
    options.headers = { ...authHeader, ...(options.headers || {}) };
    return fn.call(http, options, ...args);
  };
}

http.request = wrap(http.request);
http.get = wrap(http.get);

module.exports = { token, authHeader };

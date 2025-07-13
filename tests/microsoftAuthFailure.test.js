const assert = require('assert');
const AuthService = require('../dist/server/services/AuthService.js').default;

const service = new AuthService();

// mock fetch for failure
global.fetch = async () => ({ ok: false, status: 401 });

service.validateMicrosoftToken('badtoken')
  .then(() => {
    console.error('Expected error not thrown');
    process.exit(1);
  })
  .catch(err => {
    assert.ok(err instanceof Error);
    console.log('Microsoft token failure test passed');
  });

const assert = require('assert');
const AuthService = require('../dist/server/services/AuthService.js').default;

const service = new AuthService();

// mock fetch for successful response
global.fetch = async (url, opts) => {
  assert.strictEqual(url, 'https://graph.microsoft.com/v1.0/me');
  return {
    ok: true,
    async json() {
      return {
        id: 'user-123',
        mail: 'user@example.com',
        displayName: 'Example User',
        givenName: 'Example',
        surname: 'User'
      };
    }
  };
};

service.validateMicrosoftToken('token').then(user => {
  assert.deepStrictEqual(user, {
    objectId: 'user-123',
    email: 'user@example.com',
    displayName: 'Example User',
    firstName: 'Example',
    lastName: 'User'
  });
  console.log('Microsoft token success test passed');
}).catch(err => {
  console.error(err);
  process.exit(1);
});

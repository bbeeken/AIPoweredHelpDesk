const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const mfaTokens = new Map();

function generateMfaToken(userId) {
  const token = String(Math.floor(100000 + Math.random() * 900000));
  mfaTokens.set(userId, { token, expires: Date.now() + 5 * 60 * 1000 });
  return token;
}

function verifyMfaToken(userId, token) {
  const entry = mfaTokens.get(userId);
  if (!entry || entry.expires < Date.now()) return false;
  return entry.token === token;
}

function configureSso(provider, options = {}) {
  // Placeholder for SAML/OAuth configuration
  return { provider, options };
}

function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

function issueJwt(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', ...opts });
}

function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.scryptSync(key, 'salt', 32),
    iv,
  );
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(payload, key) {
  const [ivHex, dataHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    crypto.scryptSync(key, 'salt', 32),
    iv,
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

module.exports = {
  generateMfaToken,
  verifyMfaToken,
  configureSso,
  hasRole,
  issueJwt,
  verifyJwt,
  encrypt,
  decrypt,
};

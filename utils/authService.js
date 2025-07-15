const crypto = require("crypto");
const data = require("../data/mockData");


function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update("SALT123" + password)
    .digest("hex");
}

function authenticate(username, password) {
  const user = data.users.find((u) => u.name === username);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  return { user };
}

function verifyToken(token) {
  // Tokens are disabled
  return null;
}

module.exports = { authenticate, verifyToken };

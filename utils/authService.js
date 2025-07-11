const crypto = require("crypto");
const data = require("../data/mockData");

const SECRET = process.env.JWT_SECRET || "secret-key";

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
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ id: user.id, name: user.name, exp: Date.now() + 3600_000 })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  const token = `${header}.${body}.${signature}`;
  return { token };
}

function verifyToken(token) {
  try {
    const [headerB64, bodyB64, sig] = token.split(".");
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(bodyB64, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { authenticate, verifyToken };

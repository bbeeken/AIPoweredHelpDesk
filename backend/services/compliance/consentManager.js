const consents = new Map();

function recordConsent(userId, type) {
  const set = consents.get(userId) || new Set();
  set.add(type);
  consents.set(userId, set);
}

function withdrawConsent(userId, type) {
  const set = consents.get(userId);
  if (!set) return;
  set.delete(type);
  if (!set.size) consents.delete(userId);
}

function hasConsent(userId, type) {
  const set = consents.get(userId);
  return set ? set.has(type) : false;
}

module.exports = { recordConsent, withdrawConsent, hasConsent };

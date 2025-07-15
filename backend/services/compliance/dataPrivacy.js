function anonymize(record) {
  if (!record) return null;
  const clone = { ...record };
  if (clone.email) clone.email = 'REDACTED';
  if (clone.name) clone.name = 'REDACTED';
  return clone;
}

function deleteUserData(id, store) {
  if (!Array.isArray(store)) return;
  const idx = store.findIndex(r => r.id === id);
  if (idx !== -1) store.splice(idx, 1);
}

module.exports = { anonymize, deleteUserData };

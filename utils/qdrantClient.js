const axios = require('axios');
const crypto = require('crypto');

function textToVector(text, dim = 32) {
  const hash = crypto.createHash('sha256').update(text, 'utf8').digest();
  const vector = Array.from(hash.slice(0, dim), b => b / 255);
  if (vector.length < dim) {
    vector.push(...Array(dim - vector.length).fill(0));
  }
  return vector;
}

async function addTicketText(id, text, collection = 'tickets', qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333') {
  const vector = textToVector(text);
  const payload = {
    points: [
      { id, payload: { text }, vector }
    ]
  };
  await axios.put(`${qdrantUrl}/collections/${collection}/points`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}

module.exports = {
  addTicketText,
  textToVector
};

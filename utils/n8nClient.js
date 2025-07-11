const N8N_URL = process.env.N8N_URL || 'http://localhost:5678/webhook/ai';

module.exports.processText = async function(text, user) {
  // Send text to n8n webhook for processing using built-in fetch
  const payload = { text, user };
  const res = await fetch(N8N_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
};

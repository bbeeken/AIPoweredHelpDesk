const axios = require('axios');

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678/webhook/ai';

module.exports.processText = async function(text, user) {
  // Send text to n8n webhook for processing
  const payload = { text, user };
  const { data } = await axios.post(N8N_URL, payload);
  return data;
};

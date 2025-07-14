const aiService = require('./aiService');

function generateSuggestions(text) {
  const category = aiService.categorizeTicket(text || '');
  switch (category) {
    case 'authentication':
      return ['Reset password', 'Verify account status'];
    case 'incident':
      return ['Check logs', 'Escalate to on-call'];
    default:
      return ['Search knowledge base', 'Open new ticket'];
  }
}

module.exports = { generateSuggestions };

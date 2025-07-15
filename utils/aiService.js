const natural = require('natural');

// Naive Bayes classifier trained with a few example phrases
const classifier = new natural.BayesClassifier();
classifier.addDocument('reset my password', 'authentication');
classifier.addDocument('forgot password', 'authentication');
classifier.addDocument('cannot login', 'authentication');
classifier.addDocument('server error', 'incident');
classifier.addDocument('application crashed', 'incident');
classifier.addDocument('received error code', 'incident');
classifier.addDocument('general question', 'general');
classifier.addDocument('how does this work', 'general');
classifier.train();

const categoryDefaults = {
  authentication: { assigneeId: 1, priority: 'medium' },
  incident: { assigneeId: 2, priority: 'high' },
  general: {},
};

function categorizeTicket(text) {
  if (!text) return 'general';
  try {
    return classifier.classify(text) || 'general';
  } catch {
    return 'general';
  }
}

module.exports = { categorizeTicket, categoryDefaults };

// Placeholder for advanced AI processing
// In a real implementation this would use machine learning models
// to categorize tickets and provide automated responses.

function categorizeTicket(text) {
  text = text.toLowerCase();
  if (text.includes("password")) return "authentication";
  if (text.includes("error")) return "incident";
  return "general";
}

function analyzeSentiment(text) {
  text = text.toLowerCase();
  const positiveWords = [
    'good',
    'great',
    'excellent',
    'love',
    'awesome',
    'thank',
    'thanks',
  ];
  const negativeWords = [
    'bad',
    'terrible',
    'awful',
    'hate',
    'slow',
    'broken',
    'error',
  ];
  let score = 0;
  positiveWords.forEach((w) => {
    if (text.includes(w)) score++;
  });
  negativeWords.forEach((w) => {
    if (text.includes(w)) score--;
  });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

module.exports = { categorizeTicket, analyzeSentiment };

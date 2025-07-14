const Sentiment = require('sentiment');
const analyzer = new Sentiment();

function analyze(text) {
  const { score } = analyzer.analyze(text || '');
  let label = 'neutral';
  if (score > 1) label = 'positive';
  else if (score < -1) label = 'negative';
  return { score, label };
}

module.exports = { analyze };

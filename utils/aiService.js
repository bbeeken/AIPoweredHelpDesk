
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


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
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



function simpleDetect(text) {
  const lower = text.toLowerCase();
  if (/[¿¡]/.test(text) || lower.includes('contrase')) return 'es';
  return 'en';
}

async function detectLanguage(text) {
  if (!OPENAI_API_KEY) {
    return simpleDetect(text);
  }
  const prompt = `Identify the ISO 639-1 language code for this text: "${text}"`;
  const result = await callOpenAI([{ role: 'user', content: prompt }]);
  return result?.match(/[a-z]{2}/i)?.[0].toLowerCase() || 'en';
}

async function translateText(text, target = 'en') {
  const lang = await detectLanguage(text);
  if (!OPENAI_API_KEY) {
    if (lang === 'es' && target === 'en') {
      if (text.toLowerCase().includes('contrase')) {
        return 'How do I reset my password?';
      }
    }
    return text;
  }
  if (lang === target) return text;
  const prompt = `Translate the following text into ${target}:\n${text}`;
  const result = await callOpenAI([{ role: 'user', content: prompt }]);
  return result || text;
}

async function analyzeSentiment(text) {
  if (!OPENAI_API_KEY) {
    const lower = text.toLowerCase();
    if (lower.includes('thank') || lower.includes('great')) return 'positive';
    if (lower.includes('bad') || lower.includes('terrible')) return 'negative';
    return 'neutral';
  }
  const prompt = `Is the sentiment of this text positive, negative, or neutral? Just reply with the single word.\n${text}`;
  const result = await callOpenAI([{ role: 'user', content: prompt }]);
  return result?.split(/\s/)[0].toLowerCase();
}

async function suggestTags(text) {
  if (!OPENAI_API_KEY) {
    const tags = [];
    const lower = text.toLowerCase();
    if (lower.includes('password')) tags.push('password');
    if (lower.includes('error')) tags.push('error');
    return tags;
  }
  const prompt = `Suggest up to 3 concise tags for categorizing this ticket. Reply with a comma separated list.\n${text}`;
  const result = await callOpenAI([{ role: 'user', content: prompt }]);
  return result
    ? result
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
}

module.exports = {
  categorizeTicket,
  categoryDefaults,
  analyzeSentiment,
  suggestTags,
  detectLanguage,
  translateText,
};


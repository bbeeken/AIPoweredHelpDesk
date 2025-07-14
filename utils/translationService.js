const DEFAULT_LANG = process.env.DEFAULT_LANGUAGE || 'en';
const TRANSLATE_URL = process.env.TRANSLATE_URL;
const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY;

function detectLanguage(text) {
  if(/[\u00C0-\u017F]/.test(text) || /(hola|gracias)/i.test(text)) return 'es';
  if(/[\u00C0-\u017F]/.test(text) && /(bonjour|merci)/i.test(text)) return 'fr';
  return 'en';
}

async function translate(text, from, to = DEFAULT_LANG) {
  if(from === to) return text;
  if(TRANSLATE_URL) {
    try {
      const res = await fetch(TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(TRANSLATE_API_KEY ? { 'Authorization': `Bearer ${TRANSLATE_API_KEY}` } : {})
        },
        body: JSON.stringify({ q: text, source: from, target: to })
      });
      const data = await res.json();
      if(data.translatedText) return data.translatedText;
      if(data.translation) return data.translation;
    } catch(err) {
      console.error('Translation error', err.message);
    }
  }
  if(from === 'es' && to === 'en') {
    return text.replace(/hola/i, 'Hello');
  }
  return text;
}

async function translateToDefault(text) {
  const lang = detectLanguage(text);
  const translated = await translate(text, lang, DEFAULT_LANG);
  return { translated, lang };
}

module.exports = { detectLanguage, translateToDefault };

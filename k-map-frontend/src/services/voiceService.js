/**
 * Voice Service — Text-to-Speech & Speech Recognition
 * Uses Web Speech API (browser native — no API key needed)
 * Supports English (en-US), Tamil (ta-IN), Hindi (hi-IN)
 */

const LANGUAGE_VOICES = {
  'en-US': { lang: 'en-US', rate: 1.0, pitch: 1.0 },
  'ta-IN': { lang: 'ta-IN', rate: 0.9, pitch: 1.0 },
  'hi-IN': { lang: 'hi-IN', rate: 0.95, pitch: 1.0 },
};

// Translations for navigation phrases
const TRANSLATIONS = {
  'en-US': {
    'arrived': (name) => `You have arrived at ${name}`,
    'recalculated': 'Route recalculated',
    'off_route': 'You are off route. Recalculating...',
    'start_nav': (name) => `Starting navigation to ${name}`,
    'turn_left': 'Turn left',
    'turn_right': 'Turn right',
    'straight': 'Continue straight',
    'depart': (dir) => `Head ${dir}`,
  },
  'ta-IN': {
    'arrived': (name) => `நீங்கள் ${name} வந்துவிட்டீர்கள்`,
    'recalculated': 'பாதை மீண்டும் கணக்கிடப்பட்டது',
    'off_route': 'நீங்கள் பாதையில் இல்லை. மீண்டும் கணக்கிடுகிறோம்...',
    'start_nav': (name) => `${name} க்கு வழிசெலுத்தல் தொடங்குகிறது`,
    'turn_left': 'இடதுபுறம் திரும்புங்கள்',
    'turn_right': 'வலதுபுறம் திரும்புங்கள்',
    'straight': 'நேராக தொடருங்கள்',
    'depart': (dir) => `${dir} திசையில் செல்லுங்கள்`,
  },
  'hi-IN': {
    'arrived': (name) => `आप ${name} पहुँच गए हैं`,
    'recalculated': 'रास्ता फिर से तैयार किया गया',
    'off_route': 'आप रास्ते से भटक गए हैं। पुनः गणना हो रही है...',
    'start_nav': (name) => `${name} की ओर नेविगेशन शुरू हो रहा है`,
    'turn_left': 'बाएं मुड़ें',
    'turn_right': 'दाएं मुड़ें',
    'straight': 'सीधे चलते रहें',
    'depart': (dir) => `${dir} दिशा में जाएं`,
  },
};

let currentUtterance = null;
let recognition = null;

export const voiceService = {
  /**
   * Speak text aloud
   * @param {string} text
   * @param {string} lang - 'en-US' | 'ta-IN' | 'hi-IN'
   */
  speak(text, lang = 'en-US') {
    if (!window.speechSynthesis || !text) return;
    this.stop();
    const cfg = LANGUAGE_VOICES[lang] || LANGUAGE_VOICES['en-US'];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = cfg.lang;
    utterance.rate = cfg.rate;
    utterance.pitch = cfg.pitch;
    utterance.volume = 1;

    // Pick best available voice for language
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === cfg.lang) || voices.find(v => v.lang.startsWith(cfg.lang.split('-')[0]));
    if (preferred) utterance.voice = preferred;

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  /** Stop any ongoing speech */
  stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    currentUtterance = null;
  },

  /** Translate a navigation phrase */
  translate(key, lang = 'en-US', param) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['en-US'];
    const fn = t[key];
    if (!fn) return key;
    return typeof fn === 'function' ? fn(param) : fn;
  },

  /** Speak a translated navigation phrase */
  announce(key, lang = 'en-US', param) {
    const text = this.translate(key, lang, param);
    this.speak(text, lang);
  },

  /**
   * Start voice recognition for AI assistant
   * @param {function} onResult - called with transcript string
   * @param {function} onEnd - called when recognition stops
   */
  startListening(onResult, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return false;
    }
    if (recognition) recognition.abort();

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };
    recognition.onend = () => { recognition = null; if (onEnd) onEnd(); };
    recognition.onerror = (e) => { console.error('Speech recognition error:', e.error); if (onEnd) onEnd(); };
    recognition.start();
    return true;
  },

  stopListening() {
    if (recognition) { recognition.abort(); recognition = null; }
  },

  isSupported() {
    return !!(window.speechSynthesis && (window.SpeechRecognition || window.webkitSpeechRecognition));
  },
};

export default voiceService;

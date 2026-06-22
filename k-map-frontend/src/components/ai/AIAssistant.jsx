import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Mic, MicOff, Sparkles, ChevronRight } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { aiApi } from '../../services/apiService';
import { voiceService } from '../../services/voiceService';
import { routeService } from '../../services/routeService';

const SUGGESTIONS = [
  'Take me to the Central Library',
  'Where is the nearest canteen?',
  'Guide me to Emmanuel Auditorium',
  'Find the Medical Centre',
  'Which buildings are wheelchair accessible?',
];

const AIAssistant = () => {
  const {
    isAIOpen, setIsAIOpen, aiMessages, addAIMessage, aiTyping, setAITyping,
    clearAIMessages, userLocation, buildings, setSelectedBuilding, setSheetSnap,
    language, isVoiceNavEnabled,
  } = useAppStore();

  const [input, setInput]         = useState('');
  const [isListening, setListening] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages, aiTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    addAIMessage({ role: 'user', text: text.trim() });
    setInput('');
    setAITyping(true);

    try {
      const res = await aiApi.query(text, userLocation);
      const { response, action } = res.data;

      setTimeout(() => {
        setAITyping(false);
        addAIMessage({ role: 'assistant', text: response, action });
        if (isVoiceNavEnabled) voiceService.speak(response.replace(/\*\*(.*?)\*\*/g, '$1'), language);

        if (action?.type === 'navigate' && action.buildingId) {
          const building = buildings.find(b => b.id === action.buildingId);
          if (building) {
            setSelectedBuilding(building);
            setSheetSnap('half');
            routeService.calculateRoute(building);
          }
        } else if (action?.type === 'emergency') {
          useAppStore.getState().setIsEmergencyPanelOpen(true);
        }
      }, 600 + Math.random() * 400);
    } catch {
      setAITyping(false);
      addAIMessage({ role: 'assistant', text: '❌ Could not reach server. Is the backend running?' });
    }
  };

  const handleVoice = () => {
    if (isListening) { voiceService.stopListening(); setListening(false); return; }
    setListening(true);
    voiceService.startListening(
      (t) => { setListening(false); setInput(t); sendMessage(t); },
      () => setListening(false)
    );
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  return (
    <>
      {/* AI bubble button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setIsAIOpen(!isAIOpen)}
        title="AI Assistant"
        style={{
          position: 'absolute', bottom: 96, left: 14,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, color: '#fff',
        }}
      >
        {isAIOpen ? <X size={22} /> : <Bot size={22} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isAIOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'absolute', bottom: 158, left: 14,
              width: 'min(340px, calc(100vw - 28px))',
              maxHeight: '52vh',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 20,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
              zIndex: 30, overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '12px 14px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, #ede9fe, #f0f9ff)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={15} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>K-MAP AI Assistant</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Ask anything about campus</div>
              </div>
              {aiMessages.length > 0 && (
                <button onClick={clearAIMessages} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  Clear
                </button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 6px' }}>
              {aiMessages.length === 0 && (
                <div style={{ textAlign: 'center', paddingBottom: 10 }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, lineHeight: 1.5 }}>
                    Hi! I'm your campus navigator.<br />Try asking:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {SUGGESTIONS.slice(0, 4).map((s) => (
                      <button key={s} onClick={() => sendMessage(s)} style={{
                        background: '#f9fafb', border: '1px solid #e5e7eb',
                        borderRadius: 999, padding: '6px 12px',
                        fontSize: 11, cursor: 'pointer', color: '#374151',
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'background 0.12s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                      >
                        <ChevronRight size={10} color="#6366f1" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiMessages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}>
                  <div style={{
                    maxWidth: '86%', padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: msg.role === 'user' ? '#1a73e8' : '#f3f4f6',
                    color: msg.role === 'user' ? '#fff' : '#111827',
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {aiTyping && (
                <div style={{ display: 'flex', marginBottom: 8 }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
                    background: '#f3f4f6', display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#9ca3af',
                        animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input row */}
            <form onSubmit={handleSubmit} style={{
              padding: '8px 10px 10px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: 7, alignItems: 'center',
            }}>
              <button type="button" onClick={handleVoice} style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none',
                background: isListening ? '#fee2e2' : '#f3f4f6',
                color: isListening ? '#dc2626' : '#6b7280',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}>
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about campus…"
                style={{
                  flex: 1, border: '1px solid #e5e7eb', borderRadius: 999,
                  padding: '8px 14px', fontSize: 13, background: '#f9fafb',
                  color: '#111827', outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />

              <button type="submit" disabled={!input.trim()} style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none',
                background: input.trim() ? '#1a73e8' : '#f3f4f6',
                color: input.trim() ? '#fff' : '#9ca3af',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}>
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;

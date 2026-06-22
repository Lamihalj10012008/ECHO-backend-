import React from 'react';
import { X, Accessibility, Type, Volume2, Globe, Eye } from 'lucide-react';
import useAppStore from '../../stores/appStore';

const LANGUAGES = [
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'ta-IN', label: 'தமிழ்',  flag: '🇮🇳' },
  { code: 'hi-IN', label: 'हिंदी',    flag: '🇮🇳' },
];

const Toggle = ({ label, desc, icon, value, onToggle }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 0', borderBottom: '1px solid #f3f4f6',
  }}>
    <div style={{ color: '#1a73e8', flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{label}</div>
      {desc && <div style={{ fontSize: 11, color: '#9ca3af' }}>{desc}</div>}
    </div>
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, flexShrink: 0,
      background: value ? '#1a73e8' : '#e5e7eb', border: 'none', cursor: 'pointer',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  </div>
);

const AccessibilityPanel = ({ onClose }) => {
  const {
    accessibilityMode, toggleAccessibilityMode,
    highContrastMode, toggleHighContrast,
    largeFontMode, toggleLargeFont,
    isVoiceNavEnabled, toggleVoiceNav,
    language, setLanguage,
    navigationMode, setNavigationMode,
  } = useAppStore();

  React.useEffect(() => {
    document.documentElement.style.fontSize = largeFontMode ? '18px' : '';
  }, [largeFontMode]);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      width: 'min(290px, calc(100vw - 80px))',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 16px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#eff6ff',
      }}>
        <Accessibility size={18} color="#1a73e8" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1 }}>Accessibility</span>
        {onClose && (
          <button onClick={onClose} style={{
            background: '#e5e7eb', border: 'none', cursor: 'pointer',
            borderRadius: '50%', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280',
          }}>
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ padding: '2px 16px 14px' }}>
        <Toggle icon={<Accessibility size={16} />} label="Wheelchair Mode"
          desc="Use accessible paths with ramps & lifts"
          value={accessibilityMode} onToggle={toggleAccessibilityMode} />
        <Toggle icon={<Eye size={16} />} label="High Contrast"
          desc="Increase contrast for readability"
          value={highContrastMode} onToggle={toggleHighContrast} />
        <Toggle icon={<Type size={16} />} label="Large Text"
          desc="Increase all text sizes"
          value={largeFontMode} onToggle={toggleLargeFont} />
        <Toggle icon={<Volume2 size={16} />} label="Voice Navigation"
          desc="Spoken turn-by-turn directions"
          value={isVoiceNavEnabled} onToggle={toggleVoiceNav} />

        {/* Language */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Globe size={11} /> Voice Language
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 10,
                border: language === lang.code ? '2px solid #1a73e8' : '1px solid #e5e7eb',
                background: language === lang.code ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer', fontSize: 11,
                fontWeight: language === lang.code ? 700 : 500,
                color: language === lang.code ? '#1a73e8' : '#6b7280',
                textAlign: 'center', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 18 }}>{lang.flag}</div>
                <div>{lang.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation mode */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Navigation Mode
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'walking',    label: '🚶 Walk'  },
              { id: 'wheelchair', label: '♿ Chair'  },
              { id: 'bicycle',    label: '🚲 Bike'   },
              { id: 'running',    label: '🏃 Run'    },
            ].map(mode => (
              <button key={mode.id} onClick={() => setNavigationMode(mode.id)} style={{
                padding: '6px 10px', borderRadius: 999,
                border: navigationMode === mode.id ? '2px solid #1a73e8' : '1px solid #e5e7eb',
                background: navigationMode === mode.id ? '#eff6ff' : '#f9fafb',
                cursor: 'pointer', fontSize: 12,
                fontWeight: navigationMode === mode.id ? 700 : 500,
                color: navigationMode === mode.id ? '#1a73e8' : '#6b7280',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;

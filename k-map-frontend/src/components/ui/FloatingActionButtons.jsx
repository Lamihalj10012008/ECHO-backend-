import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LocateFixed, Square, RefreshCw, AlertTriangle,
  Moon, Sun, Satellite, Map, Volume2, VolumeX, Users,
} from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { routeService } from '../../services/routeService';

/* ─── Single FAB ────────────────────────────────────────────── */
const FAB = ({
  icon, label, onClick,
  bg = '#ffffff', color = '#374151',
  size = 46, active = false,
  activeBg = '#1a73e8', activeColor = '#ffffff',
  danger = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const resolvedBg    = danger ? '#ef4444' : active ? activeBg    : bg;
  const resolvedColor = danger ? '#ffffff' : active ? activeColor : color;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && label && (
          <motion.div
            initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
            style={{
              position: 'absolute', right: size + 10,
              background: '#111827', color: '#f9fafb',
              padding: '4px 10px', borderRadius: 6,
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)', pointerEvents: 'none',
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: resolvedBg, color: resolvedColor,
          border: danger || active ? 'none' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: danger
            ? '0 4px 16px rgba(239,68,68,0.45)'
            : active
              ? '0 4px 16px rgba(26,115,232,0.35)'
              : '0 2px 10px rgba(0,0,0,0.16)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
          outline: 'none',
        }}
      >
        {icon}
      </motion.button>
    </div>
  );
};

/* ─── FAB Cluster ───────────────────────────────────────────── */
const FloatingActionButtons = () => {
  const {
    navState, theme, setTheme,
    isVoiceNavEnabled, toggleVoiceNav,
    toggleSatellite, showSatellite,
    toggleCrowdHeatmap, showCrowdHeatmap,
    recenterMap, isLocating,
    setIsEmergencyPanelOpen,
  } = useAppStore();

  const isNavigating = navState === 'navigating';
  const isPreview    = navState === 'route_preview';

  return (
    <div style={{
      position: 'absolute',
      right: 14,
      bottom: (isNavigating || isPreview) ? 176 : 30,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 20,
      transition: 'bottom 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>

      {/* 🔴 Emergency */}
      <FAB
        icon={<AlertTriangle size={21} />}
        label="Emergency"
        onClick={() => setIsEmergencyPanelOpen(true)}
        danger size={50}
      />

      {/* ⏹ Stop nav (only while navigating/preview) */}
      {(isNavigating || isPreview) && (
        <FAB
          icon={<Square size={19} fill="#fff" color="#fff" />}
          label="Stop Navigation"
          onClick={() => routeService.stopNavigation()}
          bg="#111827" color="#fff" size={46}
        />
      )}

      {/* 👥 Crowd heatmap */}
      <FAB
        icon={<Users size={19} />}
        label={showCrowdHeatmap ? 'Hide Crowd' : 'Show Crowd'}
        onClick={toggleCrowdHeatmap}
        active={showCrowdHeatmap}
        activeBg="#8b5cf6"
        bg="#ffffff" size={46}
      />

      {/* 🛰️ Satellite */}
      <FAB
        icon={showSatellite ? <Map size={19} /> : <Satellite size={19} />}
        label={showSatellite ? 'Map View' : 'Satellite'}
        onClick={toggleSatellite}
        active={showSatellite}
        activeBg="#0f172a"
        activeColor="#38bdf8"
        bg="#ffffff" size={46}
      />

      {/* 🌙 Dark mode */}
      <FAB
        icon={theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
        label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        bg="#ffffff" size={46}
      />

      {/* 🔊 Voice */}
      <FAB
        icon={isVoiceNavEnabled ? <Volume2 size={19} /> : <VolumeX size={19} color="#9ca3af" />}
        label={isVoiceNavEnabled ? 'Voice On' : 'Voice Off'}
        onClick={toggleVoiceNav}
        active={isVoiceNavEnabled}
        bg="#ffffff" size={46}
      />

      {/* 📍 Recenter — large blue */}
      <FAB
        icon={isLocating
          ? <RefreshCw size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <LocateFixed size={22} />}
        label="My Location"
        onClick={recenterMap}
        bg="#1a73e8" color="#fff" size={56}
      />
    </div>
  );
};

export default FloatingActionButtons;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { routeService } from '../../services/routeService';

const MANEUVER_EMOJI = {
  depart: '🚶', arrive: '📍', straight: '⬆️',
  turn_left: '↩️', turn_right: '↪️', uturn: '🔄',
  roundabout: '🔄', merge: '🔀', ramp: '↗️',
};

const NavigationBanner = () => {
  const { navState, currentRoute, currentStepIndex, isOffRoute } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  if (navState !== 'navigating' || !currentRoute) return null;

  const steps = currentRoute.steps || [];
  const cur   = steps[currentStepIndex];
  const next  = steps[currentStepIndex + 1];

  const pct = steps.length > 1
    ? Math.round(((currentStepIndex + 1) / steps.length) * 100)
    : 100;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0,    opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 25, pointerEvents: 'auto',
      }}
    >
      {/* Off-route ribbon */}
      <AnimatePresence>
        {isOffRoute && (
          <motion.div
            initial={{ y: -28 }} animate={{ y: 0 }} exit={{ y: -28 }}
            style={{
              background: '#fbbf24', padding: '6px 20px',
              textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#78350f',
            }}
          >
            ⚠️&nbsp; Off Route — Recalculating…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main instruction card */}
      {cur && (
        <div style={{
          background: '#1a73e8',
          boxShadow: '0 4px 24px rgba(26,115,232,0.45)',
        }}>
          {/* Primary row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          }}>
            {/* Direction emoji */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              {MANEUVER_EMOJI[cur.maneuver] || '⬆️'}
            </div>

            {/* Instruction text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                {cur.instruction}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>
                {cur.distance?.text}
                {next && (
                  <span style={{ marginLeft: 8 }}>
                    · Then: {next.instruction}
                  </span>
                )}
              </div>
            </div>

            {/* ETA + expand */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                {currentRoute.duration?.text}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                {currentRoute.distance?.text}
              </div>
            </div>

            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: '50%', width: 32, height: 32,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', flexShrink: 0,
              }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              onClick={() => routeService.stopNavigation()}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '50%', width: 32, height: 32,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.2)' }}>
            <div style={{
              height: '100%', background: '#fff',
              width: `${pct}%`,
              transition: 'width 0.6s ease',
              borderRadius: '0 2px 2px 0',
            }} />
          </div>

          {/* Step list (expanded) */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: '#fff', overflowY: 'auto', maxHeight: '35vh',
                }}
              >
                {steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '10px 16px',
                    background: i === currentStepIndex ? '#eff6ff' : '#fff',
                    borderBottom: '1px solid #f3f4f6',
                    borderLeft: i === currentStepIndex ? '3px solid #1a73e8' : '3px solid transparent',
                  }}>
                    <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                      {MANEUVER_EMOJI[step.maneuver] || '⬆️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: i === currentStepIndex ? 700 : 500,
                        color: i === currentStepIndex ? '#1a73e8' : '#111827',
                      }}>
                        {step.instruction}
                      </div>
                      {step.distance?.text && (
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {step.distance.text}
                        </div>
                      )}
                    </div>
                    {i < currentStepIndex && (
                      <div style={{ fontSize: 14, color: '#22c55e', flexShrink: 0 }}>✓</div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default NavigationBanner;

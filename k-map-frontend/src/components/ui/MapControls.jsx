import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, X } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import AccessibilityPanel from '../accessibility/AccessibilityPanel';

const MapControls = () => {
  const [showA11y, setShowA11y] = useState(false);
  const { toggle3DMode, is3DMode } = useAppStore();

  return (
    <>
      {/* Left-side controls */}
      <div style={{
        position: 'absolute', top: 80, left: 14,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 20,
      }}>
        {/* Accessibility */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowA11y(!showA11y)}
          title="Accessibility"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: showA11y ? '#1a73e8' : '#ffffff',
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: showA11y ? '#fff' : '#374151',
            transition: 'all 0.2s',
          }}
        >
          <Accessibility size={20} />
        </motion.button>

        {/* 3D mode */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggle3DMode}
          title="Toggle 3D View"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: is3DMode ? '#1a73e8' : '#ffffff',
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: is3DMode ? '#fff' : '#374151',
            fontWeight: 800, fontSize: 13,
            transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          3D
        </motion.button>
      </div>

      {/* Accessibility panel slide-in */}
      <AnimatePresence>
        {showA11y && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            style={{ position: 'absolute', top: 80, left: 70, zIndex: 50 }}
          >
            <AccessibilityPanel onClose={() => setShowA11y(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MapControls;

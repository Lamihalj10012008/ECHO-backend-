import React, { useState } from 'react';
import { OverlayView } from '@react-google-maps/api';

const CATEGORY_ICONS = {
  academic: '🏫', hostel: '🏠', food: '🍽️', library: '📚',
  auditorium: '🎭', sports: '⚽', parking: '🅿️', medical: '🏥',
  laboratory: '🔬', administration: '🏛️', media: '📷', outdoor: '🌸',
  religious: '⛪', security: '🛡️', academic_support: '💼', gate: '🚪',
};

const CATEGORY_COLORS = {
  academic: '#6366f1', hostel: '#ec4899', food: '#f59e0b', library: '#7c3aed',
  auditorium: '#dc2626', sports: '#0284c7', parking: '#64748b', medical: '#ef4444',
  laboratory: '#0d9488', administration: '#1e40af', media: '#7c3aed', outdoor: '#16a34a',
  religious: '#db2777', security: '#dc2626', academic_support: '#059669', gate: '#78716c',
};

const BuildingMarker = ({ building, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = CATEGORY_COLORS[building.category] || '#6366f1';
  const icon = CATEGORY_ICONS[building.category] || '📍';

  return (
    <OverlayView
      position={building.coordinates}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h })}
    >
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Tooltip */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            pointerEvents: 'none',
            zIndex: 100,
            animation: 'slide-up 0.15s ease',
            maxWidth: 200,
            whiteSpace: 'normal',
            textAlign: 'center',
          }}>
            {building.shortName}
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{building.category}</div>
            {/* Arrow */}
            <div style={{
              position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
              width: 10, height: 10, background: 'var(--bg-primary)', borderRight: '1px solid var(--border-primary)',
              borderBottom: '1px solid var(--border-primary)', transform: 'translateX(-50%) rotate(45deg)',
            }} />
          </div>
        )}

        {/* Pin */}
        <div style={{
          width: isHovered ? 40 : 34,
          height: isHovered ? 40 : 34,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: color,
          boxShadow: isHovered
            ? `0 4px 16px ${color}55, 0 0 0 3px ${color}33`
            : `0 2px 8px ${color}40`,
          transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.8)',
        }}>
          <span style={{
            transform: 'rotate(45deg)',
            fontSize: isHovered ? 18 : 15,
            lineHeight: 1,
            transition: 'font-size 0.2s',
          }}>
            {icon}
          </span>
        </div>
      </div>
    </OverlayView>
  );
};

export default BuildingMarker;

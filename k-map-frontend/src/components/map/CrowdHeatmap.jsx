import React, { useMemo } from 'react';
import { OverlayView } from '@react-google-maps/api';
import useAppStore from '../../stores/appStore';
import { crowdService } from '../../services/crowdService';

/**
 * CrowdHeatmap — renders colour-coded crowd dots on every building marker
 * when the heatmap toggle is active.
 */
const CrowdHeatmap = () => {
  const { buildings, showCrowdHeatmap } = useAppStore();
  if (!showCrowdHeatmap || !buildings.length) return null;

  return (
    <>
      {buildings.map((building) => {
        const crowd = crowdService.getCrowdData(building);
        if (crowd.level === 0) return null;

        return (
          <OverlayView
            key={`crowd-${building.id}`}
            position={building.coordinates}
            mapPaneName={OverlayView.OVERLAY_LAYER}
            getPixelPositionOffset={() => ({ x: 8, y: -36 })}
          >
            <div style={{ position: 'relative', pointerEvents: 'none' }}>
              {/* Pulsing glow ring */}
              <div style={{
                position: 'absolute',
                width: 32, height: 32,
                borderRadius: '50%',
                background: `${crowd.color}22`,
                top: -4, left: -4,
                animation: crowd.level >= 4 ? 'pulse-ring 2s ease-in-out infinite' : 'none',
              }} />
              {/* Crowd dot */}
              <div
                title={`${building.shortName}: ${crowd.label} crowd`}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: crowd.color,
                  border: '2px solid #ffffff',
                  boxShadow: `0 2px 6px ${crowd.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', fontWeight: 800,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {crowd.level}
              </div>
            </div>
          </OverlayView>
        );
      })}
    </>
  );
};

/**
 * CrowdLegend — floating chip showing the legend when heatmap is active
 */
export const CrowdLegend = () => {
  const { showCrowdHeatmap } = useAppStore();
  if (!showCrowdHeatmap) return null;

  const levels = [
    { label: 'Low',  color: '#22c55e' },
    { label: 'Mod',  color: '#f59e0b' },
    { label: 'High', color: '#ef4444' },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 30, left: '50%',
      transform: 'translateX(-50%)',
      background: '#ffffff', borderRadius: 999,
      padding: '6px 16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', gap: 14,
      zIndex: 15, fontSize: 11, fontWeight: 600,
      fontFamily: 'Inter, sans-serif', color: '#374151',
    }}>
      <span style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Crowd
      </span>
      {levels.map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
          {l.label}
        </div>
      ))}
    </div>
  );
};

export default CrowdHeatmap;

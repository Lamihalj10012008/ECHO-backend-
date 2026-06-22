import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import useAppStore from '../../stores/appStore';

const UserLocationMarker = () => {
  const { userLocation, userAccuracy } = useAppStore();
  if (!userLocation) return null;

  return (
    <OverlayView
      position={userLocation}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
    >
      <div style={{ position: 'relative', width: 28, height: 28, cursor: 'default' }}>
        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          background: 'rgba(26, 115, 232, 0.15)',
          animation: 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        }} />
        {/* Accuracy circle */}
        {userAccuracy && userAccuracy < 100 && (
          <div style={{
            position: 'absolute',
            inset: -Math.min(userAccuracy / 2, 30),
            borderRadius: '50%',
            border: '2px solid rgba(26,115,232,0.25)',
            background: 'rgba(26,115,232,0.08)',
          }} />
        )}
        {/* Blue dot */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#1a73e8',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 8px rgba(26,115,232,0.5)',
          animation: 'pulse-dot 2.5s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Heading indicator dot */}
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
          }} />
        </div>
      </div>
    </OverlayView>
  );
};

export default UserLocationMarker;

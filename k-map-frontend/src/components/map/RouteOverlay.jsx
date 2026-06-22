import { useEffect, useRef } from 'react';
import { OverlayView } from '@react-google-maps/api';
import React from 'react';
import useAppStore from '../../stores/appStore';

/**
 * RouteOverlay — manages the blue route polyline imperatively via the raw
 * Google Maps API so it always cleans up correctly when the route is cleared.
 *
 * Using <Polyline> from @react-google-maps/api caused the line to linger
 * because React's unmount → setMap(null) isn't always called reliably.
 * Using google.maps.Polyline directly guarantees cleanup.
 */
const RouteOverlay = () => {
  const { navState, currentRoute, mapRef } = useAppStore();

  const mainLineRef   = useRef(null);
  const shadowLineRef = useRef(null);

  const shouldShow =
    (navState === 'route_preview' || navState === 'navigating') &&
    currentRoute?.polyline?.length >= 2;

  // ── Draw or clear the polyline whenever route/navState changes ──────────
  useEffect(() => {
    if (!mapRef || !window.google?.maps) return;

    if (shouldShow) {
      const path = currentRoute.polyline;
      const isNavigating = navState === 'navigating';
      const strokeColor  = isNavigating ? '#1a73e8' : '#4a90f3';

      // Shadow / halo
      if (!shadowLineRef.current) {
        shadowLineRef.current = new window.google.maps.Polyline();
      }
      shadowLineRef.current.setOptions({
        path,
        strokeColor: isNavigating ? 'rgba(26,115,232,0.22)' : 'rgba(74,144,243,0.18)',
        strokeOpacity: 1,
        strokeWeight: 18,
        zIndex: 1,
        map: mapRef,
      });

      // Main blue line with directional arrows
      if (!mainLineRef.current) {
        mainLineRef.current = new window.google.maps.Polyline();
      }
      mainLineRef.current.setOptions({
        path,
        strokeColor,
        strokeOpacity: 1,
        strokeWeight: 7,
        zIndex: 2,
        icons: [
          {
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW,
              scale: 3,
              strokeColor: '#ffffff',
              strokeWeight: 1.5,
              fillColor: strokeColor,
              fillOpacity: 1,
            },
            offset: '0%',
            repeat: '80px',
          },
        ],
        map: mapRef,
      });
    } else {
      // ── CLEAR — remove from map completely ──────────────────────────
      if (mainLineRef.current)   { mainLineRef.current.setMap(null);   }
      if (shadowLineRef.current) { shadowLineRef.current.setMap(null); }
    }
  }, [shouldShow, currentRoute, navState, mapRef]);

  // ── Always clean up on component unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      if (mainLineRef.current)   mainLineRef.current.setMap(null);
      if (shadowLineRef.current) shadowLineRef.current.setMap(null);
    };
  }, []);

  // ── Destination pin (rendered via OverlayView) ───────────────────────────
  if (!shouldShow || !currentRoute?.destination) return null;

  return (
    <OverlayView
      position={currentRoute.destination}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h })}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'bounce-in 0.4s ease',
        pointerEvents: 'none',
      }}>
        {/* Teardrop pin */}
        <div style={{
          background: '#ea4335', color: '#fff',
          borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(234,67,53,0.45)',
          border: '2.5px solid #fff',
          fontSize: 16,
        }}>
          <span style={{ transform: 'rotate(45deg)' }}>📍</span>
        </div>

        {/* Label */}
        <div style={{
          background: '#ffffff', borderRadius: 8,
          padding: '4px 10px', fontSize: 11, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)', marginTop: 4,
          color: '#1f2937', whiteSpace: 'nowrap',
          border: '1px solid rgba(0,0,0,0.08)',
          maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {currentRoute.destinationBuilding?.shortName || 'Destination'}
        </div>
      </div>
    </OverlayView>
  );
};

export default RouteOverlay;

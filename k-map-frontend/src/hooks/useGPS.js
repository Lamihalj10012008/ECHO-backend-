import { useEffect, useRef, useCallback } from 'react';
import useAppStore from '../stores/appStore';

// Haversine distance
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Simple EMA Kalman-like smoothing
let prevLat = null, prevLng = null;
const smooth = (lat, lng, alpha = 0.3) => {
  if (prevLat === null) { prevLat = lat; prevLng = lng; return { lat, lng }; }
  const sLat = prevLat + alpha * (lat - prevLat);
  const sLng = prevLng + alpha * (lng - prevLng);
  prevLat = sLat; prevLng = sLng;
  return { lat: sLat, lng: sLng };
};

const useGPS = () => {
  const watchIdRef = useRef(null);
  const { setUserLocation, setLocationError, setIsLocating, navState, currentRoute,
    currentStepIndex, setCurrentStepIndex, setNavState, setIsOffRoute, arrivalThresholdMeters } = useAppStore();

  const handlePosition = useCallback((pos) => {
    const { latitude, longitude, accuracy, heading } = pos.coords;
    const smoothed = smooth(latitude, longitude);
    setUserLocation(smoothed, accuracy, heading);

    // ── Navigation progress tracking ───────────────────────────────────────
    if (navState === 'navigating' && currentRoute) {
      const dest = currentRoute.destination;
      const distToDest = haversine(smoothed.lat, smoothed.lng, dest.lat, dest.lng);

      // Arrival detection
      if (distToDest <= arrivalThresholdMeters) {
        setNavState('arrived');
        return;
      }

      // Off-route detection (>40m from expected path)
      const steps = currentRoute.steps || [];
      if (steps[currentStepIndex]) {
        // Advance step if close enough
        const nextStep = steps[currentStepIndex + 1];
        if (nextStep) {
          const polyline = currentRoute.polyline || [];
          if (polyline[currentStepIndex + 1]) {
            const distToNext = haversine(smoothed.lat, smoothed.lng,
              polyline[currentStepIndex + 1].lat, polyline[currentStepIndex + 1].lng);
            if (distToNext < 15) setCurrentStepIndex(currentStepIndex + 1);
          }
        }
      }

      // Off-route: check distance to polyline
      const polyline = currentRoute.polyline || [];
      if (polyline.length > 0) {
        const minDist = Math.min(...polyline.map(p => haversine(smoothed.lat, smoothed.lng, p.lat, p.lng)));
        setIsOffRoute(minDist > 40);
      }
    }
  }, [navState, currentRoute, currentStepIndex, setUserLocation, setCurrentStepIndex, setNavState, setIsOffRoute, arrivalThresholdMeters]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported on this device.');
      return;
    }
    setIsLocating(true);

    // Fast initial fix
    navigator.geolocation.getCurrentPosition(handlePosition,
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // Continuous watch — higher rate during navigation
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => { setIsLocating(false); handlePosition(pos); },
      (err) => { setIsLocating(false); setLocationError(err.message); },
      { enableHighAccuracy: true, maximumAge: navState === 'navigating' ? 500 : 3000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [navState, handlePosition, setIsLocating, setLocationError]);
};

export default useGPS;
export { haversine };

import { useState, useEffect } from 'react';
import { CAMPUS_CENTER } from '../utils/constants';

export default function useGeolocation() {
  const [position, setPosition] = useState({
    latitude: CAMPUS_CENTER.lat,
    longitude: CAMPUS_CENTER.lng,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setPosition(prev => ({ ...prev, loading: false, error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return position;
}

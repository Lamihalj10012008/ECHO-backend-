import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/api';
import { CAMPUS_CENTER } from '../utils/constants';

const MOCK_WEATHER = {
  temperature: 28, feels_like: 30, condition: 'Partly Cloudy',
  humidity: 65, wind_speed: 12, uv_index: 5, precipitation: 0,
  cloud_cover: 40, is_outdoor_friendly: true,
};

export default function useWeather() {
  const [weather, setWeather] = useState({ ...MOCK_WEATHER, loading: true });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await fetchWeather(CAMPUS_CENTER.lat, CAMPUS_CENTER.lng);
      if (mounted && res?.data) {
        setWeather({ ...res.data, loading: false });
      } else if (mounted) {
        setWeather({ ...MOCK_WEATHER, loading: false });
      }
    };
    load();
    const interval = setInterval(load, 600000); // 10 min
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return weather;
}

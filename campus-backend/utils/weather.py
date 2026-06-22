"""
ECHO AI Smart Campus — Weather Integration
Uses wttr.in free API (no key required) with caching.
"""
import time
import requests

_weather_cache = {}
_CACHE_TTL = 600  # 10 minutes


def get_weather(lat, lng):
    """Fetch current weather for given coordinates. Returns dict with weather data."""
    cache_key = f"{round(lat, 2)},{round(lng, 2)}"

    # Check cache
    if cache_key in _weather_cache:
        cached = _weather_cache[cache_key]
        if time.time() - cached['timestamp'] < _CACHE_TTL:
            return cached['data']

    try:
        url = f"https://wttr.in/{lat},{lng}?format=j1"
        resp = requests.get(url, timeout=5, headers={'User-Agent': 'ECHO-Campus/1.0'})
        resp.raise_for_status()
        data = resp.json()

        current = data.get('current_condition', [{}])[0]
        weather = {
            'temperature': int(current.get('temp_C', 28)),
            'feels_like': int(current.get('FeelsLikeC', 28)),
            'condition': current.get('weatherDesc', [{'value': 'Partly Cloudy'}])[0].get('value', 'Partly Cloudy'),
            'humidity': int(current.get('humidity', 65)),
            'wind_speed': int(current.get('windspeedKmph', 12)),
            'uv_index': int(current.get('uvIndex', 5)),
            'precipitation': float(current.get('precipMM', 0)),
            'cloud_cover': int(current.get('cloudcover', 40)),
            'visibility': int(current.get('visibility', 10)),
            'is_outdoor_friendly': True
        }

        # Determine outdoor friendliness
        weather['is_outdoor_friendly'] = (
            weather['precipitation'] < 2.0 and
            weather['temperature'] < 38 and
            weather['wind_speed'] < 40
        )

        # Cache the result
        _weather_cache[cache_key] = {'data': weather, 'timestamp': time.time()}
        return weather

    except Exception:
        # Return sensible defaults for Coimbatore climate
        return {
            'temperature': 28,
            'feels_like': 30,
            'condition': 'Partly Cloudy',
            'humidity': 65,
            'wind_speed': 12,
            'uv_index': 5,
            'precipitation': 0,
            'cloud_cover': 40,
            'visibility': 10,
            'is_outdoor_friendly': True
        }

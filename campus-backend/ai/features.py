"""
ECHO AI — Feature Engineering Pipeline
Extracts spatial, temporal, crowd, and weather features for the scoring engine.
"""
import math
from datetime import datetime
from utils.geo import haversine, walking_time, bearing


class FeatureExtractor:
    """Extracts normalized features from raw location and context data."""

    @staticmethod
    def extract_spatial(user_lat, user_lng, loc_lat, loc_lng):
        """Compute spatial features between user and location."""
        distance_m = haversine(user_lat, user_lng, loc_lat, loc_lng)
        walk_min = walking_time(distance_m)
        bear = bearing(user_lat, user_lng, loc_lat, loc_lng)
        return {
            'distance_m': round(distance_m, 1),
            'walking_time_min': walk_min,
            'bearing': round(bear, 1),
            'proximity_score': max(0, 1 - (distance_m / 2000))  # Normalize to 2km max
        }

    @staticmethod
    def extract_temporal():
        """Extract time-based features."""
        now = datetime.now()
        hour = now.hour
        dow = now.weekday()  # 0=Monday, 6=Sunday
        return {
            'hour': hour,
            'day_of_week': dow,
            'is_weekend': dow >= 5,
            'is_morning': 6 <= hour < 12,
            'is_afternoon': 12 <= hour < 17,
            'is_evening': 17 <= hour < 21,
            'is_night': hour >= 21 or hour < 6,
            'is_exam_period': False,  # Could be set from academic calendar
            'is_meal_time': hour in [7, 8, 12, 13, 19, 20]
        }

    @staticmethod
    def extract_crowd(crowd_level, activity_type):
        """Compute crowd fitness score based on activity type preferences."""
        crowd_values = {'low': 0.2, 'moderate': 0.5, 'high': 0.8, 'very_high': 1.0}
        crowd_val = crowd_values.get(crowd_level, 0.5)

        # Activity-aware crowd fitness
        if activity_type == 'study':
            # Study prefers low crowds
            score = 1.0 - crowd_val
        elif activity_type == 'social':
            # Social prefers higher crowds
            score = crowd_val
        elif activity_type == 'photography':
            # Photography prefers low to moderate
            score = max(0, 1.0 - (crowd_val * 1.2))
        elif activity_type == 'sports':
            # Sports prefers moderate crowds (enough for teams, not too packed)
            score = 1.0 - abs(crowd_val - 0.5) * 2
        elif activity_type == 'relaxation':
            # Relaxation strongly prefers low crowds
            score = max(0, 1.0 - (crowd_val * 1.5))
        else:
            score = 0.5

        return {
            'crowd_level': crowd_level,
            'crowd_fitness': round(max(0, min(1, score)), 3)
        }

    @staticmethod
    def extract_weather(weather_data, category):
        """Compute weather impact scores for indoor/outdoor locations."""
        if not weather_data:
            return {'indoor_score': 0.5, 'outdoor_score': 0.5, 'weather_match': 0.5}

        temp = weather_data.get('temperature', 28)
        precip = weather_data.get('precipitation', 0)
        uv = weather_data.get('uv_index', 5)
        is_outdoor = weather_data.get('is_outdoor_friendly', True)

        # Outdoor comfort score
        temp_comfort = 1.0 - abs(temp - 25) / 20  # Peak comfort at 25°C
        rain_penalty = 1.0 if precip < 1 else (0.5 if precip < 5 else 0.1)
        outdoor_score = max(0, min(1, temp_comfort * rain_penalty))

        # Indoor always viable, but bonus when weather is bad
        indoor_score = 0.7 + (1 - outdoor_score) * 0.3

        # Category-specific weather matching
        outdoor_categories = {'photography', 'sports', 'relaxation'}
        indoor_categories = {'study', 'social'}

        if category in outdoor_categories:
            weather_match = outdoor_score
            # Photography bonus during golden hour or overcast (soft light)
            if category == 'photography' and (uv < 4 or weather_data.get('cloud_cover', 0) > 60):
                weather_match = min(1, weather_match + 0.2)
        else:
            weather_match = indoor_score

        return {
            'indoor_score': round(indoor_score, 3),
            'outdoor_score': round(outdoor_score, 3),
            'weather_match': round(weather_match, 3)
        }

    @staticmethod
    def extract_time_relevance(peak_hours, category):
        """Determine if current time is optimal for visiting this location."""
        now = datetime.now()
        hour = now.hour

        # Category-based time preferences
        optimal_hours = {
            'study': [(6, 9), (20, 22)],       # Early morning, late evening
            'social': [(12, 14), (17, 21)],     # Lunch, evening
            'photography': [(6, 8), (17, 19)],  # Golden hours
            'sports': [(5, 8), (16, 19)],       # Cool hours
            'relaxation': [(10, 12), (17, 19)]  # Mid-morning, sunset
        }

        windows = optimal_hours.get(category, [(9, 17)])
        for start, end in windows:
            if start <= hour < end:
                return 1.0
            # Partial score for near-optimal times (within 1 hour)
            if abs(hour - start) <= 1 or abs(hour - end) <= 1:
                return 0.6

        return 0.3  # Off-peak baseline

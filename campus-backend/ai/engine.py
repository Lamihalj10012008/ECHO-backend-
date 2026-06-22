"""
ECHO AI — Core Recommendation Engine
Orchestrates feature extraction, scoring, and ranking.
Works with or without a PostgreSQL database.
"""
from ai.features import FeatureExtractor
from ai.scoring import MultiFactorScorer
from utils.geo import haversine, walking_time


class RecommendationEngine:
    """
    Production-grade recommendation engine using multi-factor scoring.
    Falls back to in-memory data when database is unavailable.
    """

    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.scorer = MultiFactorScorer()

    def get_recommendations(self, user_lat, user_lng, activity_type,
                            locations, weather=None, student_id=None, limit=5):
        """
        Generate AI-powered location recommendations.

        Args:
            user_lat: User's latitude
            user_lng: User's longitude
            activity_type: One of study|social|photography|sports|relaxation
            locations: List of location dicts (from DB or fallback)
            weather: Optional weather data dict
            student_id: Optional student ID for personalization
            limit: Max results to return

        Returns:
            List of scored recommendation dicts with AI explanations.
        """
        candidates = []

        for loc in locations:
            # Filter by activity category
            if loc.get('category') != activity_type:
                continue

            # Extract features
            spatial = self.feature_extractor.extract_spatial(
                user_lat, user_lng, loc['latitude'], loc['longitude']
            )
            temporal = self.feature_extractor.extract_temporal()
            crowd = self.feature_extractor.extract_crowd(
                loc.get('crowd_level', 'moderate'), activity_type
            )
            weather_features = self.feature_extractor.extract_weather(
                weather, activity_type
            )
            time_relevance = self.feature_extractor.extract_time_relevance(
                loc.get('peak_hours', {}), activity_type
            )

            # Build feature vector for scoring
            features = {
                'proximity': spatial['proximity_score'],
                'crowd_fit': crowd['crowd_fitness'],
                'rating': loc.get('rating', 4.0) / 5.0,
                'weather_match': weather_features['weather_match'],
                'time_relevance': time_relevance,
                'history_pref': 0.6,  # Default; would use DB history if available
                'event_aware': 0.5,   # Default; would check active events
                'freshness': 0.7,     # Default; would use recommendation_history
            }

            # Compute composite score
            score, breakdown = self.scorer.compute_score(features)

            # Generate human-readable explanation
            explanation = self.scorer.generate_explanation(
                breakdown, loc['name'], activity_type
            )

            # Determine open/closed status
            is_open = loc.get('is_open', True)

            # Get image
            images = loc.get('images', [])
            image = images[0] if images else 'https://images.unsplash.com/photo-1562774053-701939374585?w=600'

            candidates.append({
                'id': loc.get('id'),
                'name': loc['name'],
                'description': loc.get('description', ''),
                'category': loc['category'],
                'latitude': loc['latitude'],
                'longitude': loc['longitude'],
                'distance_m': spatial['distance_m'],
                'walking_time': spatial['walking_time_min'],
                'match_score': score,
                'crowd_level': loc.get('crowd_level', 'moderate'),
                'rating': float(loc.get('rating', 4.0)),
                'review_count': loc.get('review_count', 0),
                'is_open': is_open,
                'ai_reason': explanation,
                'image': image,
                'facilities': loc.get('facilities', []),
                'factors': breakdown
            })

        # Sort by score descending
        candidates.sort(key=lambda x: x['match_score'], reverse=True)

        return candidates[:limit]

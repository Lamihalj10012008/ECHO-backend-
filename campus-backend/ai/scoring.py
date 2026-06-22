"""
ECHO AI — Multi-Factor Scoring System
8-factor weighted composite scoring for location recommendations.
"""


class MultiFactorScorer:
    """
    Production-grade multi-factor scoring engine.

    Score = Σ(w_i × f_i) where:
      - Proximity:     w=0.25  | Closer is better (Haversine normalized)
      - Crowd Fit:     w=0.20  | Activity-aware crowd preference
      - Rating:        w=0.15  | User ratings normalized to 0-1
      - Weather Match: w=0.10  | Indoor/outdoor weather suitability
      - Time Relevance:w=0.10  | Is now a good time for this category?
      - History Pref:  w=0.08  | User's past positive interactions
      - Event Aware:   w=0.07  | Nearby events boost social, penalize study
      - Freshness:     w=0.05  | Encourage variety, decay repeat visits
    """

    WEIGHTS = {
        'proximity':     0.25,
        'crowd_fit':     0.20,
        'rating':        0.15,
        'weather_match': 0.10,
        'time_relevance':0.10,
        'history_pref':  0.08,
        'event_aware':   0.07,
        'freshness':     0.05,
    }

    @classmethod
    def compute_score(cls, features):
        """
        Compute a weighted composite score from extracted features.

        Args:
            features: dict with keys matching WEIGHTS keys, each value 0-1.

        Returns:
            tuple: (total_score: float 0-100, factor_breakdown: dict)
        """
        breakdown = {}
        total = 0.0

        for factor, weight in cls.WEIGHTS.items():
            value = features.get(factor, 0.5)
            value = max(0, min(1, value))  # Clamp to [0, 1]
            weighted = value * weight
            total += weighted
            breakdown[factor] = {
                'raw': round(value, 3),
                'weight': weight,
                'weighted': round(weighted, 4),
                'percentage': f"{round(weight * 100)}%"
            }

        # Scale to 0-100
        score = round(total * 100, 2)

        return score, breakdown

    @classmethod
    def generate_explanation(cls, factors, location_name, activity_type):
        """
        Generate human-readable AI reasoning from factor breakdown.

        Returns a natural language explanation of why this location was recommended.
        """
        reasons = []

        # Proximity
        prox = factors.get('proximity', {}).get('raw', 0)
        if prox > 0.8:
            reasons.append("very close to your current location")
        elif prox > 0.5:
            reasons.append("within comfortable walking distance")

        # Crowd fit
        crowd = factors.get('crowd_fit', {}).get('raw', 0)
        if crowd > 0.7:
            if activity_type == 'study':
                reasons.append("quiet environment ideal for focused study")
            elif activity_type == 'social':
                reasons.append("lively atmosphere perfect for socializing")
            elif activity_type == 'photography':
                reasons.append("uncrowded setting great for photography")
            elif activity_type == 'relaxation':
                reasons.append("peaceful and uncrowded for relaxation")
            elif activity_type == 'sports':
                reasons.append("good crowd for team activities")

        # Rating
        rating = factors.get('rating', {}).get('raw', 0)
        if rating > 0.9:
            reasons.append("one of the highest-rated spots on campus")
        elif rating > 0.8:
            reasons.append("highly rated by students")

        # Weather
        weather = factors.get('weather_match', {}).get('raw', 0)
        if weather > 0.8:
            reasons.append("current weather conditions are ideal for this location")

        # Time relevance
        time_rel = factors.get('time_relevance', {}).get('raw', 0)
        if time_rel > 0.8:
            reasons.append("this is the optimal time to visit")
        elif time_rel > 0.5:
            reasons.append("good timing for this type of activity")

        # Hidden gem / freshness
        freshness = factors.get('freshness', {}).get('raw', 0)
        if freshness > 0.8:
            reasons.append("a fresh discovery you haven't explored recently")

        if not reasons:
            reasons.append(f"solid all-around match for {activity_type}")

        explanation = f"{location_name}: " + ", ".join(reasons) + "."
        return explanation[0].upper() + explanation[1:]

"""
ECHO AI — Crowd Predictor & Insights Generator
Predicts crowd levels, best visit times, and discovers hidden gems.
"""
from datetime import datetime


class CrowdPredictor:
    """Generates crowd predictions and campus insights using historical patterns."""

    # Typical crowd patterns by category and time (simulated ML model output)
    CROWD_PATTERNS = {
        'study': {
            'peak_hours': [(9, 12), (15, 17)],
            'quiet_hours': [(6, 8), (20, 22)],
            'weekend_modifier': 0.4  # 40% of weekday traffic
        },
        'social': {
            'peak_hours': [(12, 14), (17, 21)],
            'quiet_hours': [(6, 11)],
            'weekend_modifier': 1.3  # More social on weekends
        },
        'photography': {
            'peak_hours': [(6, 8), (17, 19)],
            'quiet_hours': [(10, 16)],
            'weekend_modifier': 1.5
        },
        'sports': {
            'peak_hours': [(6, 8), (16, 19)],
            'quiet_hours': [(10, 15)],
            'weekend_modifier': 1.4
        },
        'relaxation': {
            'peak_hours': [(17, 19)],
            'quiet_hours': [(9, 16)],
            'weekend_modifier': 1.2
        }
    }

    @classmethod
    def predict_crowd(cls, category, hours_ahead=1):
        """Predict crowd level for a category N hours from now."""
        now = datetime.now()
        future_hour = (now.hour + hours_ahead) % 24
        is_weekend = now.weekday() >= 5

        pattern = cls.CROWD_PATTERNS.get(category, cls.CROWD_PATTERNS['social'])

        # Check if future hour falls in peak
        for start, end in pattern['peak_hours']:
            if start <= future_hour < end:
                level = 'high'
                break
        else:
            for start, end in pattern['quiet_hours']:
                if start <= future_hour < end:
                    level = 'low'
                    break
            else:
                level = 'moderate'

        # Weekend adjustment
        if is_weekend and level == 'high':
            mod = pattern['weekend_modifier']
            if mod < 1:
                level = 'moderate'

        return {
            'predicted_level': level,
            'hours_ahead': hours_ahead,
            'confidence': 0.78,
            'future_hour': future_hour
        }

    @classmethod
    def get_best_time(cls, category):
        """Return optimal visit windows for a category."""
        pattern = cls.CROWD_PATTERNS.get(category, {})
        quiet = pattern.get('quiet_hours', [(10, 16)])

        windows = []
        for start, end in quiet:
            period = 'AM' if start < 12 else 'PM'
            end_period = 'AM' if end < 12 else 'PM'
            s = start if start <= 12 else start - 12
            e = end if end <= 12 else end - 12
            windows.append(f"{s}:00 {period} - {e}:00 {end_period}")

        return {
            'category': category,
            'optimal_windows': windows,
            'advice': f"Visit during off-peak hours for the best {category} experience."
        }

    @classmethod
    def get_hidden_gems(cls, locations, activity_type=None):
        """Find undervisited locations with high ratings."""
        gems = []
        for loc in locations:
            if activity_type and loc.get('category') != activity_type:
                continue
            rating = loc.get('rating', 0)
            reviews = loc.get('review_count', 0)
            crowd = loc.get('crowd_level', 'moderate')

            # High rating + low reviews + low crowd = hidden gem
            if rating >= 4.5 and reviews < 100 and crowd in ('low', 'moderate'):
                gems.append({
                    'name': loc['name'],
                    'category': loc['category'],
                    'rating': rating,
                    'review_count': reviews,
                    'crowd_level': crowd,
                    'reason': f"⭐ {rating} rating but only {reviews} reviews — a hidden treasure!"
                })

        return sorted(gems, key=lambda x: x['rating'], reverse=True)[:5]

    @classmethod
    def generate_crowd_predictions(cls, locations):
        """Generate crowd predictions for key locations."""
        predictions = []
        now = datetime.now()

        key_locations = [
            {'name': 'Central Library', 'category': 'study', 'peak_hour': 14},
            {'name': 'Sports Complex', 'category': 'sports', 'peak_hour': 17},
            {'name': 'Main Canteen', 'category': 'social', 'peak_hour': 12},
            {'name': 'Study Halls', 'category': 'study', 'peak_hour': 15},
        ]

        for loc in key_locations:
            hours_until = loc['peak_hour'] - now.hour
            if hours_until > 0:
                pred = cls.predict_crowd(loc['category'], hours_until)
                period = 'PM' if loc['peak_hour'] >= 12 else 'AM'
                display_hour = loc['peak_hour'] if loc['peak_hour'] <= 12 else loc['peak_hour'] - 12
                predictions.append({
                    'location': loc['name'],
                    'prediction': f"{loc['name']} expected to reach {pred['predicted_level'].upper()} by {display_hour}:00 {period}",
                    'level': pred['predicted_level'],
                    'confidence': pred['confidence']
                })

        return predictions

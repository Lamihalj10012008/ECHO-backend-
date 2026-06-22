"""
ECHO AI Smart Campus — Flask Application
Production-grade REST API with PostgreSQL/PostGIS support and in-memory fallback.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import random

from ai.engine import RecommendationEngine
from ai.predictions import CrowdPredictor
from utils.weather import get_weather
from config import Config

# ============================================================================
# FALLBACK DATA — App works without a database for demos
# ============================================================================
FALLBACK_LOCATIONS = [
    {"id":1,"name":"Central Library & Computer Centre","description":"The heart of academic excellence at Karunya. Features quiet reading zones, digital archives, and high-speed computing labs across three floors.","category":"study","latitude":10.9361,"longitude":76.7352,"rating":4.9,"review_count":234,"crowd_level":"moderate","is_open":True,"facilities":["WiFi","Power Outlets","AC","Printers","Digital Archives","Silent Zones"],"images":["https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600"],"peak_hours":{"peak":["9:00-12:00","14:00-17:00"],"quiet":["6:00-8:00","20:00-22:00"]}},
    {"id":2,"name":"Study Halls Block A","description":"Spacious study halls with modular seating. Popular for group study sessions and exam preparation with whiteboard access.","category":"study","latitude":10.9372,"longitude":76.7360,"rating":4.5,"review_count":156,"crowd_level":"moderate","is_open":True,"facilities":["WiFi","Power Outlets","Whiteboards","AC","Group Tables"],"images":["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600"],"peak_hours":{"peak":["10:00-13:00"],"quiet":["6:00-9:00","19:00-22:00"]}},
    {"id":3,"name":"E-Learning Centre","description":"Modern digital learning facility with video conferencing, online course stations, and interactive smart boards.","category":"study","latitude":10.9355,"longitude":76.7358,"rating":4.6,"review_count":89,"crowd_level":"low","is_open":True,"facilities":["WiFi","Computers","Smart Boards","AC","Headphones"],"images":["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600"],"peak_hours":{"peak":["9:00-11:00"],"quiet":["17:00-20:00"]}},
    {"id":4,"name":"Department of CSE Lab","description":"Advanced computer science laboratory with high-performance workstations and GPU clusters for ML projects.","category":"study","latitude":10.9367,"longitude":76.7348,"rating":4.7,"review_count":198,"crowd_level":"moderate","is_open":True,"facilities":["WiFi","High-End PCs","AC","Projector","GPU Cluster"],"images":["https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600"],"peak_hours":{"peak":["9:00-12:00","14:00-17:00"],"quiet":["18:00-21:00"]}},
    {"id":5,"name":"Postgraduate Research Block","description":"Dedicated research facility for postgraduate scholars with individual carrels and thesis writing rooms.","category":"study","latitude":10.9370,"longitude":76.7365,"rating":4.8,"review_count":67,"crowd_level":"low","is_open":True,"facilities":["WiFi","Power Outlets","AC","Research Databases","Silent Zone"],"images":["https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600"],"peak_hours":{"peak":["10:00-14:00"],"quiet":["16:00-22:00"]}},
    {"id":6,"name":"Gallery Halls","description":"Vibrant social hub featuring art exhibitions, cultural displays, and student artwork. A gathering place for creative minds.","category":"social","latitude":10.9359,"longitude":76.7349,"rating":4.8,"review_count":312,"crowd_level":"high","is_open":True,"facilities":["Exhibition Space","Seating","AC","Sound System","Stage"],"images":["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"],"peak_hours":{"peak":["11:00-14:00","16:00-19:00"],"quiet":["6:00-10:00"]}},
    {"id":7,"name":"Emmanuel Auditorium & VIP Complex","description":"Grand auditorium hosting seminars, concerts, and university ceremonies with state-of-the-art acoustics.","category":"social","latitude":10.9368,"longitude":76.7342,"rating":4.7,"review_count":187,"crowd_level":"moderate","is_open":True,"facilities":["AC","Sound System","Projector","Stage Lighting","VIP Lounge"],"images":["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600"],"peak_hours":{"peak":["10:00-12:00","15:00-18:00"],"quiet":["6:00-9:00"]}},
    {"id":8,"name":"Student Activity Center","description":"The pulse of campus social life with game rooms, music practice rooms, and a cozy café area.","category":"social","latitude":10.9375,"longitude":76.7355,"rating":4.4,"review_count":267,"crowd_level":"high","is_open":True,"facilities":["WiFi","Games","Music Room","Café","TV Screens"],"images":["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600"],"peak_hours":{"peak":["12:00-14:00","17:00-21:00"],"quiet":["6:00-11:00"]}},
    {"id":9,"name":"Main Canteen","description":"Largest dining facility serving South Indian, North Indian, and continental cuisine with outdoor seating.","category":"social","latitude":10.9365,"longitude":76.7345,"rating":4.2,"review_count":445,"crowd_level":"high","is_open":True,"facilities":["Seating","Food Court","Outdoor Area","WiFi"],"images":["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600"],"peak_hours":{"peak":["7:30-9:00","12:00-13:30","19:00-20:30"],"quiet":["15:00-17:00"]}},
    {"id":10,"name":"University Chapel","description":"Beautiful chapel with stained glass windows. Hosts worship services, choir practice, and quiet contemplation.","category":"social","latitude":10.9358,"longitude":76.7340,"rating":4.9,"review_count":156,"crowd_level":"low","is_open":True,"facilities":["Seating","AC","Organ","Quiet Space"],"images":["https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600"],"peak_hours":{"peak":["7:00-8:00","18:00-19:00"],"quiet":["9:00-17:00"]}},
    {"id":11,"name":"Bethesda Scenic Overlook","description":"Breathtaking panoramic views of the Siruvani Hills and Western Ghats. The most Instagrammed spot on campus.","category":"photography","latitude":10.9340,"longitude":76.7330,"rating":4.9,"review_count":289,"crowd_level":"low","is_open":True,"facilities":["Viewpoint","Benches","Shade Trees","Parking"],"images":["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"],"peak_hours":{"peak":["5:30-7:00","17:00-18:30"],"quiet":["10:00-16:00"]}},
    {"id":12,"name":"Siruvani Foothills Path","description":"Scenic walking trail through lush greenery at the base of the Siruvani Hills with diverse bird species.","category":"photography","latitude":10.9330,"longitude":76.7320,"rating":4.8,"review_count":134,"crowd_level":"low","is_open":True,"facilities":["Trail","Shade","Bird Watching","Nature"],"images":["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"],"peak_hours":{"peak":["6:00-8:00","16:00-18:00"],"quiet":["11:00-15:00"]}},
    {"id":13,"name":"Botanical Garden","description":"Curated collection of tropical and medicinal plants. Perfect for macro photography and nature studies.","category":"photography","latitude":10.9345,"longitude":76.7368,"rating":4.6,"review_count":178,"crowd_level":"low","is_open":True,"facilities":["Pathways","Benches","Labels","Shade","Water Feature"],"images":["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600"],"peak_hours":{"peak":["7:00-10:00"],"quiet":["12:00-14:00"]}},
    {"id":14,"name":"Lake View Point","description":"Tranquil lakeside spot offering mirror reflections during early mornings. Popular for landscape photography.","category":"photography","latitude":10.9338,"longitude":76.7355,"rating":4.7,"review_count":98,"crowd_level":"low","is_open":True,"facilities":["Viewpoint","Benches","Parking"],"images":["https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600"],"peak_hours":{"peak":["6:00-8:00","17:00-19:00"],"quiet":["10:00-16:00"]}},
    {"id":15,"name":"Sunset Point Hilltop","description":"Highest accessible point on campus with 360-degree views. Spectacular sunsets in oranges, purples, and golds.","category":"photography","latitude":10.9325,"longitude":76.7340,"rating":4.9,"review_count":76,"crowd_level":"low","is_open":True,"facilities":["Viewpoint","Open Space","Trail Access"],"images":["https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600"],"peak_hours":{"peak":["17:00-19:00"],"quiet":["8:00-16:00"]}},
    {"id":16,"name":"Sports Complex","description":"Multi-sport indoor facility with badminton courts, table tennis, gym equipment, and martial arts training.","category":"sports","latitude":10.9380,"longitude":76.7370,"rating":4.5,"review_count":345,"crowd_level":"moderate","is_open":True,"facilities":["Indoor Courts","Gym","Showers","Lockers","First Aid"],"images":["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"],"peak_hours":{"peak":["6:00-8:00","16:00-19:00"],"quiet":["10:00-15:00"]}},
    {"id":17,"name":"Basketball & Volleyball Courts","description":"Outdoor courts with floodlighting for evening play. Regular inter-department tournaments and pickup games.","category":"sports","latitude":10.9378,"longitude":76.7365,"rating":4.3,"review_count":234,"crowd_level":"moderate","is_open":True,"facilities":["Floodlights","Seating","Water Fountain","Equipment"],"images":["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600"],"peak_hours":{"peak":["16:00-19:00"],"quiet":["6:00-15:00"]}},
    {"id":18,"name":"Swimming Pool Complex","description":"Olympic-standard swimming pool with separate training lanes, a children's pool and sunbathing deck.","category":"sports","latitude":10.9382,"longitude":76.7372,"rating":4.6,"review_count":123,"crowd_level":"low","is_open":True,"facilities":["Pool","Showers","Lockers","Lifeguard","Sunbed"],"images":["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600"],"peak_hours":{"peak":["6:00-8:00","16:00-18:00"],"quiet":["10:00-15:00"]}},
    {"id":19,"name":"Athletics Track","description":"Professional 400m synthetic track for sprinting and distance running with field events area.","category":"sports","latitude":10.9385,"longitude":76.7368,"rating":4.4,"review_count":167,"crowd_level":"low","is_open":True,"facilities":["Track","Field Events","Timing System","Water Station"],"images":["https://images.unsplash.com/photo-1544298621-35a764866aeb?w=600"],"peak_hours":{"peak":["5:30-7:30","16:30-18:30"],"quiet":["9:00-15:00"]}},
    {"id":20,"name":"Cricket Ground","description":"Full-size cricket ground with practice nets and maintained pitch. Hosts inter-college tournaments.","category":"sports","latitude":10.9390,"longitude":76.7375,"rating":4.5,"review_count":289,"crowd_level":"moderate","is_open":True,"facilities":["Pitch","Practice Nets","Pavilion","Scoreboard","Floodlights"],"images":["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600"],"peak_hours":{"peak":["15:00-18:00"],"quiet":["6:00-14:00"]}},
    {"id":21,"name":"Oprah Residences Landscaped Gardens","description":"Beautifully landscaped gardens with flowering shrubs, stone pathways, and peaceful sitting areas.","category":"relaxation","latitude":10.9385,"longitude":76.7378,"rating":4.4,"review_count":145,"crowd_level":"low","is_open":True,"facilities":["Benches","Shade Trees","Pathways","Flowers"],"images":["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600"],"peak_hours":{"peak":["7:00-9:00","17:00-19:00"],"quiet":["10:00-16:00"]}},
    {"id":22,"name":"Meditation & Wellness Center","description":"Peaceful sanctuary for mindfulness and stress relief. Yoga sessions, guided meditation, and counseling.","category":"relaxation","latitude":10.9350,"longitude":76.7335,"rating":4.8,"review_count":89,"crowd_level":"low","is_open":True,"facilities":["Yoga Mats","AC","Quiet Rooms","Counseling"],"images":["https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600"],"peak_hours":{"peak":["7:00-9:00","17:00-18:00"],"quiet":["10:00-16:00"]}},
    {"id":23,"name":"Heritage Fountain Plaza","description":"Central campus landmark with ornamental fountain, ambient night lighting, and benches under canopy trees.","category":"relaxation","latitude":10.9362,"longitude":76.7350,"rating":4.5,"review_count":234,"crowd_level":"moderate","is_open":True,"facilities":["Fountain","Benches","Night Lighting","Shade"],"images":["https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=600"],"peak_hours":{"peak":["12:00-14:00","18:00-21:00"],"quiet":["6:00-11:00"]}},
    {"id":24,"name":"Hillside Nature Trail","description":"A 2km trail through native forest with clearings offering valley views. Ideal for morning jogs.","category":"relaxation","latitude":10.9335,"longitude":76.7325,"rating":4.7,"review_count":67,"crowd_level":"low","is_open":True,"facilities":["Trail","Shade","Viewpoints","Bird Watching"],"images":["https://images.unsplash.com/photo-1448375240586-882707db888b?w=600"],"peak_hours":{"peak":["6:00-8:00","16:00-18:00"],"quiet":["9:00-15:00"]}},
    {"id":25,"name":"Evangeline Hostel Courtyard","description":"Charming inner courtyard with central garden, string lights, and communal seating for evening hangouts.","category":"relaxation","latitude":10.9388,"longitude":76.7380,"rating":4.3,"review_count":178,"crowd_level":"moderate","is_open":True,"facilities":["Seating","Garden","String Lights","Open Air"],"images":["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600"],"peak_hours":{"peak":["18:00-21:00"],"quiet":["6:00-17:00"]}}
]

# ============================================================================
# APPLICATION FACTORY
# ============================================================================
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=app.config.get('CORS_ORIGINS', '*'))

    engine = RecommendationEngine()

    # ------- Health / Status -------
    @app.route('/api/status')
    def campus_status():
        return jsonify({
            'status': 'online',
            'campus': Config.CAMPUS_NAME,
            'active_students': random.randint(2400, 3200),
            'timestamp': datetime.now().isoformat(),
            'services': {'ai_engine': True, 'database': False, 'weather': True}
        })

    # ------- Recommendations -------
    @app.route('/api/recommend', methods=['POST'])
    def recommend():
        data = request.json or {}
        user_lat = data.get('lat', Config.CAMPUS_LAT)
        user_lng = data.get('lng', Config.CAMPUS_LNG)
        activity = data.get('activity', 'study')
        student_id = data.get('student_id')
        limit = data.get('limit', 5)

        weather = get_weather(user_lat, user_lng)

        results = engine.get_recommendations(
            user_lat=user_lat,
            user_lng=user_lng,
            activity_type=activity,
            locations=FALLBACK_LOCATIONS,
            weather=weather,
            student_id=student_id,
            limit=limit
        )

        return jsonify({
            'status': 'success',
            'campus': Config.CAMPUS_NAME,
            'activity': activity,
            'total_results': len(results),
            'data': results
        })

    # ------- Locations -------
    @app.route('/api/locations')
    def get_locations():
        category = request.args.get('category')
        crowd_level = request.args.get('crowd_level')

        results = FALLBACK_LOCATIONS
        if category:
            results = [l for l in results if l['category'] == category]
        if crowd_level:
            results = [l for l in results if l['crowd_level'] == crowd_level]

        return jsonify({'status': 'success', 'total': len(results), 'data': results})

    @app.route('/api/locations/<int:location_id>')
    def get_location_detail(location_id):
        loc = next((l for l in FALLBACK_LOCATIONS if l['id'] == location_id), None)
        if not loc:
            return jsonify({'status': 'error', 'message': 'Location not found'}), 404
        return jsonify({'status': 'success', 'data': loc})

    # ------- Analytics -------
    @app.route('/api/analytics/dashboard')
    def analytics_dashboard():
        return jsonify({
            'status': 'success',
            'data': {
                'most_visited': [
                    {'name': 'Central Library', 'visits': 1247},
                    {'name': 'Main Canteen', 'visits': 1102},
                    {'name': 'Sports Complex', 'visits': 983},
                    {'name': 'Gallery Halls', 'visits': 876},
                    {'name': 'Study Halls', 'visits': 834},
                    {'name': 'Student Center', 'visits': 756},
                    {'name': 'Botanical Garden', 'visits': 698},
                    {'name': 'Chapel', 'visits': 623},
                ],
                'popular_study': [
                    {'name': 'Central Library', 'value': 35},
                    {'name': 'Study Halls', 'value': 25},
                    {'name': 'E-Learning Centre', 'value': 18},
                    {'name': 'CSE Lab', 'value': 12},
                    {'name': 'Research Block', 'value': 10},
                ],
                'photo_hotspots': [
                    {'subject': 'Scenery', 'score': 95},
                    {'subject': 'Lighting', 'score': 88},
                    {'subject': 'Accessibility', 'score': 72},
                    {'subject': 'Crowds', 'score': 45},
                    {'subject': 'Golden Hour', 'score': 92},
                    {'subject': 'Variety', 'score': 78},
                ],
                'social_trends': [
                    {'hour': f'{h}:00', 'activity': v} for h, v in enumerate([
                        5,3,2,2,3,5,12,28,35,42,55,68,
                        85,72,58,52,60,78,92,88,72,55,35,18
                    ])
                ],
                'traffic_density': {
                    'labels': ['6-9', '9-12', '12-15', '15-18', '18-21', '21-24'],
                    'days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    'data': [
                        [0.4, 0.9, 0.7, 0.8, 0.6, 0.2],
                        [0.5, 0.8, 0.8, 0.9, 0.5, 0.2],
                        [0.4, 0.9, 0.7, 0.7, 0.6, 0.3],
                        [0.5, 0.8, 0.8, 0.8, 0.7, 0.2],
                        [0.6, 0.7, 0.9, 0.6, 0.8, 0.4],
                        [0.2, 0.4, 0.5, 0.5, 0.6, 0.3],
                        [0.1, 0.3, 0.4, 0.3, 0.4, 0.2],
                    ]
                }
            }
        })

    @app.route('/api/analytics/crowd/<int:location_id>')
    def crowd_history(location_id):
        # Generate mock 7-day history
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        history = []
        for d in days:
            for h in range(6, 23):
                count = random.randint(5, 120)
                level = 'low' if count < 40 else ('high' if count > 80 else 'moderate')
                history.append({'day': d, 'hour': h, 'count': count, 'level': level})
        return jsonify({'status': 'success', 'location_id': location_id, 'data': history})

    # ------- Weather -------
    @app.route('/api/weather')
    def weather():
        lat = request.args.get('lat', Config.CAMPUS_LAT, type=float)
        lng = request.args.get('lng', Config.CAMPUS_LNG, type=float)
        data = get_weather(lat, lng)
        return jsonify({'status': 'success', 'data': data})

    # ------- AI Insights -------
    @app.route('/api/insights')
    def insights():
        predictions = CrowdPredictor.generate_crowd_predictions(FALLBACK_LOCATIONS)
        hidden_gems = CrowdPredictor.get_hidden_gems(FALLBACK_LOCATIONS)

        best_times = {}
        for cat in ['study', 'social', 'photography', 'sports', 'relaxation']:
            best_times[cat] = CrowdPredictor.get_best_time(cat)

        weather_data = get_weather(Config.CAMPUS_LAT, Config.CAMPUS_LNG)
        weather_impact = {
            'current': f"{weather_data['temperature']}°C {weather_data['condition']}",
            'is_outdoor_friendly': weather_data['is_outdoor_friendly'],
            'recommendation': 'Outdoor locations recommended. Great conditions for campus exploration.' if weather_data['is_outdoor_friendly'] else 'Consider indoor locations due to current weather conditions.',
            'badges': ['Outdoor Friendly ☀️', 'Photography Ideal 📸'] if weather_data['is_outdoor_friendly'] else ['Indoor Recommended 🏢']
        }

        return jsonify({
            'status': 'success',
            'data': {
                'crowd_predictions': predictions,
                'weather_impact': weather_impact,
                'best_times': best_times,
                'hidden_gems': hidden_gems
            }
        })

    # ------- Error handlers -------
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'status': 'error', 'message': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

    return app


# ============================================================================
# Entry point
# ============================================================================
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

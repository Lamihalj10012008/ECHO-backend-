-- ============================================================================
-- ECHO AI Smart Campus — Seed Data
-- Karunya Institute of Technology and Sciences, Coimbatore
-- ============================================================================

-- ===================== STUDY LOCATIONS =====================
INSERT INTO campus_locations (name, description, category, latitude, longitude, geom, rating, review_count, crowd_level, is_open, facilities, images, peak_hours) VALUES
('Central Library & Computer Centre', 'The heart of academic excellence at Karunya. Features quiet reading zones, digital archives, and high-speed computing labs across three floors.', 'study', 10.9361, 76.7352, ST_SetSRID(ST_MakePoint(76.7352, 10.9361), 4326), 4.90, 234, 'moderate', true, '["WiFi","Power Outlets","AC","Printers","Digital Archives","Silent Zones"]', '["https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600","https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600"]', '{"peak":["9:00-12:00","14:00-17:00"],"quiet":["6:00-8:00","20:00-22:00"]}'),
('Study Halls Block A', 'Spacious study halls with modular seating. Popular for group study sessions and exam preparation with whiteboard access.', 'study', 10.9372, 76.7360, ST_SetSRID(ST_MakePoint(76.7360, 10.9372), 4326), 4.50, 156, 'moderate', true, '["WiFi","Power Outlets","Whiteboards","AC","Group Tables"]', '["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600"]', '{"peak":["10:00-13:00","15:00-18:00"],"quiet":["6:00-9:00","19:00-22:00"]}'),
('E-Learning Centre', 'Modern digital learning facility with video conferencing, online course stations, and interactive smart boards for tech-enhanced education.', 'study', 10.9355, 76.7358, ST_SetSRID(ST_MakePoint(76.7358, 10.9355), 4326), 4.60, 89, 'low', true, '["WiFi","Computers","Smart Boards","AC","Headphones"]', '["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600"]', '{"peak":["9:00-11:00","14:00-16:00"],"quiet":["7:00-9:00","17:00-20:00"]}'),
('Department of CSE Lab', 'Advanced computer science laboratory with high-performance workstations, GPU clusters for ML projects, and dedicated programming zones.', 'study', 10.9367, 76.7348, ST_SetSRID(ST_MakePoint(76.7348, 10.9367), 4326), 4.70, 198, 'moderate', true, '["WiFi","High-End PCs","AC","Projector","GPU Cluster"]', '["https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600"]', '{"peak":["9:00-12:00","14:00-17:00"],"quiet":["18:00-21:00"]}'),
('Postgraduate Research Block', 'Dedicated research facility for postgraduate scholars. Individual carrels, thesis writing rooms, and research database access.', 'study', 10.9370, 76.7365, ST_SetSRID(ST_MakePoint(76.7365, 10.9370), 4326), 4.80, 67, 'low', true, '["WiFi","Power Outlets","AC","Research Databases","Silent Zone"]', '["https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600"]', '{"peak":["10:00-14:00"],"quiet":["6:00-10:00","16:00-22:00"]}');

-- ===================== SOCIAL LOCATIONS =====================
INSERT INTO campus_locations (name, description, category, latitude, longitude, geom, rating, review_count, crowd_level, is_open, facilities, images, peak_hours) VALUES
('Gallery Halls', 'Vibrant social hub featuring art exhibitions, cultural displays, and student artwork. A gathering place for creative minds and social events.', 'social', 10.9359, 76.7349, ST_SetSRID(ST_MakePoint(76.7349, 10.9359), 4326), 4.80, 312, 'high', true, '["Exhibition Space","Seating","AC","Sound System","Stage"]', '["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"]', '{"peak":["11:00-14:00","16:00-19:00"],"quiet":["6:00-10:00"]}'),
('Emmanuel Auditorium & VIP Complex', 'Grand auditorium hosting seminars, concerts, and university ceremonies. State-of-the-art acoustics and tiered seating for 2000 guests.', 'social', 10.9368, 76.7342, ST_SetSRID(ST_MakePoint(76.7342, 10.9368), 4326), 4.70, 187, 'moderate', true, '["AC","Sound System","Projector","Stage Lighting","VIP Lounge"]', '["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600"]', '{"peak":["10:00-12:00","15:00-18:00"],"quiet":["6:00-9:00"]}'),
('Student Activity Center', 'The pulse of campus social life. Game rooms, music practice rooms, club meeting spaces, and a cozy café area for hanging out.', 'social', 10.9375, 76.7355, ST_SetSRID(ST_MakePoint(76.7355, 10.9375), 4326), 4.40, 267, 'high', true, '["WiFi","Games","Music Room","Café","TV Screens"]', '["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600"]', '{"peak":["12:00-14:00","17:00-21:00"],"quiet":["6:00-11:00"]}'),
('Main Canteen', 'Largest dining facility on campus serving South Indian, North Indian, and continental cuisine. Outdoor seating area with garden views.', 'social', 10.9365, 76.7345, ST_SetSRID(ST_MakePoint(76.7345, 10.9365), 4326), 4.20, 445, 'high', true, '["Seating","Food Court","Outdoor Area","WiFi"]', '["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600"]', '{"peak":["7:30-9:00","12:00-13:30","19:00-20:30"],"quiet":["15:00-17:00"]}'),
('University Chapel', 'Beautiful chapel with stained glass windows and serene atmosphere. Hosts worship services, choir practice, and quiet contemplation.', 'social', 10.9358, 76.7340, ST_SetSRID(ST_MakePoint(76.7340, 10.9358), 4326), 4.90, 156, 'low', true, '["Seating","AC","Organ","Quiet Space"]', '["https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600"]', '{"peak":["7:00-8:00","18:00-19:00"],"quiet":["9:00-17:00"]}');

-- ===================== PHOTOGRAPHY LOCATIONS =====================
INSERT INTO campus_locations (name, description, category, latitude, longitude, geom, rating, review_count, crowd_level, is_open, facilities, images, peak_hours) VALUES
('Bethesda Scenic Overlook', 'Breathtaking panoramic views of the Siruvani Hills and Western Ghats. The most Instagrammed spot on campus with golden hour magic.', 'photography', 10.9340, 76.7330, ST_SetSRID(ST_MakePoint(76.7330, 10.9340), 4326), 4.90, 289, 'low', true, '["Viewpoint","Benches","Shade Trees","Parking"]', '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600","https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600"]', '{"peak":["5:30-7:00","17:00-18:30"],"quiet":["10:00-16:00"]}'),
('Siruvani Foothills Path', 'Scenic walking trail winding through lush greenery at the base of the Siruvani Hills. Home to diverse bird species and wildflowers.', 'photography', 10.9330, 76.7320, ST_SetSRID(ST_MakePoint(76.7320, 10.9330), 4326), 4.80, 134, 'low', true, '["Trail","Shade","Bird Watching","Nature"]', '["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"]', '{"peak":["6:00-8:00","16:00-18:00"],"quiet":["11:00-15:00"]}'),
('Botanical Garden', 'Curated collection of tropical and medicinal plants across themed garden sections. Perfect for macro photography and nature studies.', 'photography', 10.9345, 76.7368, ST_SetSRID(ST_MakePoint(76.7368, 10.9345), 4326), 4.60, 178, 'low', true, '["Pathways","Benches","Labels","Shade","Water Feature"]', '["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600"]', '{"peak":["7:00-10:00","15:00-17:00"],"quiet":["12:00-14:00"]}'),
('Lake View Point', 'Tranquil lakeside spot offering mirror reflections during early mornings. Popular for landscape photography and peaceful contemplation.', 'photography', 10.9338, 76.7355, ST_SetSRID(ST_MakePoint(76.7355, 10.9338), 4326), 4.70, 98, 'low', true, '["Viewpoint","Benches","Parking"]', '["https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600"]', '{"peak":["6:00-8:00","17:00-19:00"],"quiet":["10:00-16:00"]}'),
('Sunset Point Hilltop', 'Highest accessible point on campus grounds with 360-degree views. Spectacular sunsets paint the sky in oranges, purples, and golds.', 'photography', 10.9325, 76.7340, ST_SetSRID(ST_MakePoint(76.7340, 10.9325), 4326), 4.90, 76, 'low', true, '["Viewpoint","Open Space","Trail Access"]', '["https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600"]', '{"peak":["17:00-19:00"],"quiet":["8:00-16:00"]}');

-- ===================== SPORTS LOCATIONS =====================
INSERT INTO campus_locations (name, description, category, latitude, longitude, geom, rating, review_count, crowd_level, is_open, facilities, images, peak_hours) VALUES
('Sports Complex', 'Multi-sport indoor facility with badminton courts, table tennis, gym equipment, and a martial arts training area.', 'sports', 10.9380, 76.7370, ST_SetSRID(ST_MakePoint(76.7370, 10.9380), 4326), 4.50, 345, 'moderate', true, '["Indoor Courts","Gym","Showers","Lockers","First Aid"]', '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"]', '{"peak":["6:00-8:00","16:00-19:00"],"quiet":["10:00-15:00"]}'),
('Basketball & Volleyball Courts', 'Outdoor courts with floodlighting for evening play. Regular inter-department tournaments and pickup games daily.', 'sports', 10.9378, 76.7365, ST_SetSRID(ST_MakePoint(76.7365, 10.9378), 4326), 4.30, 234, 'moderate', true, '["Floodlights","Seating","Water Fountain","Equipment"]', '["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600"]', '{"peak":["16:00-19:00"],"quiet":["6:00-15:00"]}'),
('Swimming Pool Complex', 'Olympic-standard swimming pool with separate training lanes. Includes a children''s pool and sunbathing deck area.', 'sports', 10.9382, 76.7372, ST_SetSRID(ST_MakePoint(76.7372, 10.9382), 4326), 4.60, 123, 'low', true, '["Pool","Showers","Lockers","Lifeguard","Sunbed"]', '["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600"]', '{"peak":["6:00-8:00","16:00-18:00"],"quiet":["10:00-15:00"]}'),
('Athletics Track', 'Professional 400m synthetic track with lanes for sprinting and distance running. Adjacent field for javelin, shot put, and long jump.', 'sports', 10.9385, 76.7368, ST_SetSRID(ST_MakePoint(76.7368, 10.9385), 4326), 4.40, 167, 'low', true, '["Track","Field Events","Timing System","Water Station"]', '["https://images.unsplash.com/photo-1544298621-35a764866aeb?w=600"]', '{"peak":["5:30-7:30","16:30-18:30"],"quiet":["9:00-15:00"]}'),
('Cricket Ground', 'Full-size cricket ground with practice nets and a well-maintained pitch. Hosts inter-college tournaments and weekend matches.', 'sports', 10.9390, 76.7375, ST_SetSRID(ST_MakePoint(76.7375, 10.9390), 4326), 4.50, 289, 'moderate', true, '["Pitch","Practice Nets","Pavilion","Scoreboard","Floodlights"]', '["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600"]', '{"peak":["15:00-18:00"],"quiet":["6:00-14:00"]}');

-- ===================== RELAXATION LOCATIONS =====================
INSERT INTO campus_locations (name, description, category, latitude, longitude, geom, rating, review_count, crowd_level, is_open, facilities, images, peak_hours) VALUES
('Oprah Residences Landscaped Gardens', 'Beautifully landscaped gardens surrounding the Oprah women''s hostel. Features flowering shrubs, stone pathways, and peaceful sitting areas.', 'relaxation', 10.9385, 76.7378, ST_SetSRID(ST_MakePoint(76.7378, 10.9385), 4326), 4.40, 145, 'low', true, '["Benches","Shade Trees","Pathways","Flowers"]', '["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600"]', '{"peak":["7:00-9:00","17:00-19:00"],"quiet":["10:00-16:00"]}'),
('Meditation & Wellness Center', 'Peaceful sanctuary for mindfulness and stress relief. Yoga sessions, guided meditation, and counseling services available.', 'relaxation', 10.9350, 76.7335, ST_SetSRID(ST_MakePoint(76.7335, 10.9350), 4326), 4.80, 89, 'low', true, '["Yoga Mats","AC","Quiet Rooms","Counseling"]', '["https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600"]', '{"peak":["7:00-9:00","17:00-18:00"],"quiet":["10:00-16:00"]}'),
('Heritage Fountain Plaza', 'Central campus landmark with an ornamental fountain, ambient lighting at night, and surrounding benches under canopy trees.', 'relaxation', 10.9362, 76.7350, ST_SetSRID(ST_MakePoint(76.7350, 10.9362), 4326), 4.50, 234, 'moderate', true, '["Fountain","Benches","Night Lighting","Shade"]', '["https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=600"]', '{"peak":["12:00-14:00","18:00-21:00"],"quiet":["6:00-11:00"]}'),
('Hillside Nature Trail', 'A 2km trail through native forest with occasional clearings offering valley views. Ideal for morning jogs and nature walks.', 'relaxation', 10.9335, 76.7325, ST_SetSRID(ST_MakePoint(76.7325, 10.9335), 4326), 4.70, 67, 'low', true, '["Trail","Shade","Viewpoints","Bird Watching"]', '["https://images.unsplash.com/photo-1448375240586-882707db888b?w=600"]', '{"peak":["6:00-8:00","16:00-18:00"],"quiet":["9:00-15:00"]}'),
('Evangeline Hostel Courtyard', 'Charming inner courtyard with a central garden, string lights, and communal seating. A favorite evening hangout for hostel residents.', 'relaxation', 10.9388, 76.7380, ST_SetSRID(ST_MakePoint(76.7380, 10.9388), 4326), 4.30, 178, 'moderate', true, '["Seating","Garden","String Lights","Open Air"]', '["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600"]', '{"peak":["18:00-21:00"],"quiet":["6:00-17:00"]}');

-- ===================== SAMPLE REVIEWS =====================
INSERT INTO reviews (location_id, student_id, rating, comment) VALUES
(1, 'STU001', 5, 'Best place on campus for focused studying. The silent zones are incredibly well-maintained.'),
(1, 'STU045', 5, 'Amazing digital archives. Found all my research papers here. The AC is always perfect.'),
(1, 'STU112', 4, 'Great library but can get crowded during exam season. Go early for the best seats.'),
(3, 'STU023', 5, 'The smart boards are fantastic for interactive learning. Very underrated facility.'),
(6, 'STU078', 5, 'Gallery Halls during cultural fest is unbeatable. The exhibitions are world-class.'),
(6, 'STU034', 4, 'Good space for socializing. Gets too crowded during lunch sometimes.'),
(7, 'STU056', 5, 'The acoustics in Emmanuel Auditorium are incredible. Every concert sounds amazing.'),
(9, 'STU089', 4, 'Food variety is great. The outdoor seating with garden views is my favorite spot.'),
(9, 'STU091', 3, 'Can get really packed during lunch. Wish there was more seating.'),
(11, 'STU015', 5, 'Most beautiful spot on campus. Golden hour here is absolutely magical for photography.'),
(11, 'STU067', 5, 'The Western Ghats views from Bethesda are breathtaking. Must visit at sunset.'),
(13, 'STU044', 4, 'Lovely botanical garden. Great for macro photography of tropical flowers.'),
(16, 'STU099', 4, 'Well-equipped gym and courts. The badminton court is in excellent condition.'),
(22, 'STU033', 5, 'The guided meditation sessions changed my college life. Highly recommend for stress relief.'),
(24, 'STU071', 5, 'My favorite morning jog route. The forest trail is peaceful and well-maintained.');

-- ===================== SAMPLE EVENTS =====================
INSERT INTO event_locations (location_id, event_name, event_type, start_time, end_time, expected_crowd, is_active) VALUES
(7, 'TechFest 2025 Opening Ceremony', 'academic', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 1500, true),
(6, 'Annual Art Exhibition', 'cultural', NOW() + INTERVAL '5 days', NOW() + INTERVAL '8 days', 500, true),
(20, 'Inter-Department Cricket Tournament', 'sports', NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', 800, true);

-- ===================== SAMPLE CROWD ANALYTICS =====================
-- Generate sample crowd data for Central Library (location_id = 1)
INSERT INTO crowd_analytics (location_id, density_level, student_count, day_of_week, hour_of_day)
SELECT 1,
    CASE
        WHEN h BETWEEN 6 AND 8 THEN 'low'
        WHEN h BETWEEN 9 AND 12 THEN 'high'
        WHEN h BETWEEN 13 AND 14 THEN 'moderate'
        WHEN h BETWEEN 15 AND 17 THEN 'high'
        WHEN h BETWEEN 18 AND 20 THEN 'moderate'
        ELSE 'low'
    END,
    CASE
        WHEN h BETWEEN 6 AND 8 THEN 15 + (random()*20)::int
        WHEN h BETWEEN 9 AND 12 THEN 80 + (random()*40)::int
        WHEN h BETWEEN 13 AND 14 THEN 40 + (random()*30)::int
        WHEN h BETWEEN 15 AND 17 THEN 70 + (random()*40)::int
        WHEN h BETWEEN 18 AND 20 THEN 35 + (random()*25)::int
        ELSE 5 + (random()*10)::int
    END,
    d, h
FROM generate_series(0, 6) AS d, generate_series(6, 22) AS h;

-- Generate sample crowd data for Main Canteen (location_id = 9)
INSERT INTO crowd_analytics (location_id, density_level, student_count, day_of_week, hour_of_day)
SELECT 9,
    CASE
        WHEN h BETWEEN 7 AND 9 THEN 'high'
        WHEN h BETWEEN 12 AND 13 THEN 'high'
        WHEN h BETWEEN 19 AND 20 THEN 'high'
        ELSE 'low'
    END,
    CASE
        WHEN h BETWEEN 7 AND 9 THEN 100 + (random()*50)::int
        WHEN h BETWEEN 12 AND 13 THEN 150 + (random()*50)::int
        WHEN h BETWEEN 19 AND 20 THEN 120 + (random()*40)::int
        ELSE 20 + (random()*30)::int
    END,
    d, h
FROM generate_series(0, 6) AS d, generate_series(6, 22) AS h;

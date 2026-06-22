-- ============================================================================
-- ECHO AI Smart Campus — PostGIS Geospatial Query Library
-- ============================================================================

-- 1. Find nearest N locations within a given radius (meters)
-- Usage: Replace $1=user_lng, $2=user_lat, $3=radius_meters, $4=limit
SELECT
    id, name, category, rating, crowd_level, is_open, facilities, images,
    ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance_meters,
    ROUND(ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 83.33, 1) AS walking_time_min,
    latitude, longitude
FROM campus_locations
WHERE ST_DWithin(
    geom::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    $3  -- radius in meters
)
AND is_open = true
ORDER BY distance_meters ASC
LIMIT $4;


-- 2. Find nearest locations filtered by category
SELECT
    id, name, category, rating, crowd_level, facilities,
    ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance_meters,
    ROUND(ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 83.33, 1) AS walking_time_min
FROM campus_locations
WHERE category = $3
  AND ST_DWithin(
      geom::geography,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      2000  -- 2km radius
  )
  AND is_open = true
ORDER BY distance_meters ASC;


-- 3. Crowd heatmap data aggregation (for Leaflet heatmap layer)
SELECT
    cl.latitude,
    cl.longitude,
    COALESCE(ca.avg_count, 0) AS intensity
FROM campus_locations cl
LEFT JOIN (
    SELECT location_id, AVG(student_count) AS avg_count
    FROM crowd_analytics
    WHERE day_of_week = EXTRACT(DOW FROM NOW())
      AND hour_of_day = EXTRACT(HOUR FROM NOW())
    GROUP BY location_id
) ca ON cl.id = ca.location_id;


-- 4. Campus boundary geofence check
-- Returns true if the point is within the Karunya campus approximate bounds
SELECT ST_Contains(
    ST_MakeEnvelope(76.7280, 10.9290, 76.7420, 10.9420, 4326),
    ST_SetSRID(ST_MakePoint($1, $2), 4326)
) AS is_on_campus;


-- 5. Location density clustering — find areas with highest student concentration
SELECT
    ST_X(ST_Centroid(cluster_geom)) AS cluster_lng,
    ST_Y(ST_Centroid(cluster_geom)) AS cluster_lat,
    student_count
FROM (
    SELECT
        ST_Collect(geom) AS cluster_geom,
        COUNT(*) AS student_count
    FROM student_locations
    WHERE recorded_at > NOW() - INTERVAL '30 minutes'
    GROUP BY ST_SnapToGrid(geom, 0.001)
) AS clusters
ORDER BY student_count DESC
LIMIT 10;


-- 6. Average crowd level per location for the current time slot
SELECT
    cl.id, cl.name, cl.category,
    ROUND(AVG(ca.student_count)) AS avg_students,
    MODE() WITHIN GROUP (ORDER BY ca.density_level) AS typical_density
FROM campus_locations cl
JOIN crowd_analytics ca ON cl.id = ca.location_id
WHERE ca.hour_of_day = EXTRACT(HOUR FROM NOW())
GROUP BY cl.id, cl.name, cl.category
ORDER BY avg_students DESC;

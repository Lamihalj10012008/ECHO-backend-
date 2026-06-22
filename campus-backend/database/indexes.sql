-- ============================================================================
-- ECHO AI Smart Campus — Database Indexes
-- ============================================================================
-- Run after schema.sql:
--   psql -U echo_user -d echo_campus -f indexes.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- GIST indexes on geometry columns (spatial queries)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_campus_locations_geom
    ON campus_locations USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_student_locations_geom
    ON student_locations USING GIST (geom);

-- ---------------------------------------------------------------------------
-- B-tree indexes on frequently filtered / joined columns
-- ---------------------------------------------------------------------------

-- campus_locations
CREATE INDEX IF NOT EXISTS idx_campus_locations_category
    ON campus_locations (category);

CREATE INDEX IF NOT EXISTS idx_campus_locations_crowd_level
    ON campus_locations (crowd_level);

CREATE INDEX IF NOT EXISTS idx_campus_locations_is_open
    ON campus_locations (is_open);

CREATE INDEX IF NOT EXISTS idx_campus_locations_rating
    ON campus_locations (rating DESC);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_location_id
    ON reviews (location_id);

CREATE INDEX IF NOT EXISTS idx_reviews_student_id
    ON reviews (student_id);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at
    ON reviews (created_at DESC);

-- recommendation_history
CREATE INDEX IF NOT EXISTS idx_recommendation_history_student
    ON recommendation_history (student_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_history_location
    ON recommendation_history (location_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_history_created
    ON recommendation_history (created_at DESC);

-- crowd_analytics
CREATE INDEX IF NOT EXISTS idx_crowd_analytics_location
    ON crowd_analytics (location_id);

CREATE INDEX IF NOT EXISTS idx_crowd_analytics_day_hour
    ON crowd_analytics (day_of_week, hour_of_day);

CREATE INDEX IF NOT EXISTS idx_crowd_analytics_recorded_at
    ON crowd_analytics (recorded_at DESC);

-- event_locations
CREATE INDEX IF NOT EXISTS idx_event_locations_location
    ON event_locations (location_id);

CREATE INDEX IF NOT EXISTS idx_event_locations_active
    ON event_locations (is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_event_locations_times
    ON event_locations (start_time, end_time);

-- student_locations
CREATE INDEX IF NOT EXISTS idx_student_locations_student
    ON student_locations (student_id);

CREATE INDEX IF NOT EXISTS idx_student_locations_recorded
    ON student_locations (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_locations_activity
    ON student_locations (activity_type);

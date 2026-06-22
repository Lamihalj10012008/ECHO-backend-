-- ============================================================================
-- ECHO AI Smart Campus — PostgreSQL + PostGIS Schema
-- ============================================================================
-- Run this file once against a fresh database:
--   psql -U echo_user -d echo_campus -f schema.sql
-- ============================================================================

-- Enable PostGIS extension (required for geometry types and spatial functions)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 1. campus_locations — Every point of interest on campus
-- ============================================================================
CREATE TABLE IF NOT EXISTS campus_locations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    category        VARCHAR(50)     NOT NULL
                        CHECK (category IN (
                            'study', 'social', 'photography',
                            'sports', 'relaxation'
                        )),
    geom            GEOMETRY(Point, 4326) NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    rating          NUMERIC(3, 2)   DEFAULT 4.00
                        CHECK (rating >= 0 AND rating <= 5),
    review_count    INTEGER         DEFAULT 0,
    crowd_level     VARCHAR(20)     DEFAULT 'moderate'
                        CHECK (crowd_level IN (
                            'low', 'moderate', 'high', 'very_high'
                        )),
    is_open         BOOLEAN         DEFAULT TRUE,
    open_time       TIME            DEFAULT '06:00:00',
    close_time      TIME            DEFAULT '22:00:00',
    facilities      JSONB           DEFAULT '[]'::jsonb,
    images          JSONB           DEFAULT '[]'::jsonb,
    peak_hours      JSONB           DEFAULT '{}'::jsonb,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. student_locations — Real-time / recent student positions
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_locations (
    id              SERIAL PRIMARY KEY,
    student_id      VARCHAR(100)    NOT NULL,
    geom            GEOMETRY(Point, 4326),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    activity_type   VARCHAR(50),
    recorded_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. reviews — Student reviews for campus locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER         NOT NULL
                        REFERENCES campus_locations(id) ON DELETE CASCADE,
    student_id      VARCHAR(100)    NOT NULL,
    rating          INTEGER         NOT NULL
                        CHECK (rating >= 1 AND rating <= 5),
    comment         TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. recommendation_history — What the AI recommended and why
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendation_history (
    id              SERIAL PRIMARY KEY,
    student_id      VARCHAR(100)    NOT NULL,
    activity_type   VARCHAR(50)     NOT NULL,
    location_id     INTEGER
                        REFERENCES campus_locations(id) ON DELETE SET NULL,
    match_score     NUMERIC(5, 4)   NOT NULL,
    factors         JSONB           DEFAULT '{}'::jsonb,
    weather_data    JSONB           DEFAULT '{}'::jsonb,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. crowd_analytics — Historical crowd density observations
-- ============================================================================
CREATE TABLE IF NOT EXISTS crowd_analytics (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER         NOT NULL
                        REFERENCES campus_locations(id) ON DELETE CASCADE,
    density_level   VARCHAR(20)     NOT NULL
                        CHECK (density_level IN (
                            'low', 'moderate', 'high', 'very_high'
                        )),
    student_count   INTEGER         DEFAULT 0,
    recorded_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    day_of_week     INTEGER         CHECK (day_of_week BETWEEN 0 AND 6),
    hour_of_day     INTEGER         CHECK (hour_of_day BETWEEN 0 AND 23)
);

-- ============================================================================
-- 6. event_locations — Campus events tied to locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_locations (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER         NOT NULL
                        REFERENCES campus_locations(id) ON DELETE CASCADE,
    event_name      VARCHAR(300)    NOT NULL,
    event_type      VARCHAR(100),
    start_time      TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time        TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_crowd  INTEGER         DEFAULT 0,
    is_active       BOOLEAN         DEFAULT TRUE
);

-- Auto-update the updated_at column on campus_locations
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_campus_locations_updated
    BEFORE UPDATE ON campus_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

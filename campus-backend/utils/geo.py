"""
ECHO AI Smart Campus — Geospatial Utilities
Haversine distance, walking time, and bearing calculations.
"""
import math


def haversine(lat1, lng1, lat2, lng2):
    """Calculate the great-circle distance between two points in meters."""
    R = 6371000  # Earth's radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (math.sin(d_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def walking_time(distance_meters, speed_kmh=5.0):
    """Estimate walking time in minutes given distance in meters."""
    speed_mpm = (speed_kmh * 1000) / 60  # meters per minute (~83.33)
    return round(distance_meters / speed_mpm, 1)


def bearing(lat1, lng1, lat2, lng2):
    """Calculate initial bearing from point 1 to point 2 in degrees."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_lambda = math.radians(lng2 - lng1)

    x = math.sin(d_lambda) * math.cos(phi2)
    y = (math.cos(phi1) * math.sin(phi2) -
         math.sin(phi1) * math.cos(phi2) * math.cos(d_lambda))

    theta = math.atan2(x, y)
    return (math.degrees(theta) + 360) % 360

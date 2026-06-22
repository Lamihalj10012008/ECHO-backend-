import React, { useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Polyline, Polygon } from '@react-google-maps/api';
import useAppStore from '../../stores/appStore';
import UserLocationMarker from './UserLocationMarker';
import BuildingMarker from './BuildingMarker';
import RouteOverlay from './RouteOverlay';
import CrowdHeatmap, { CrowdLegend } from './CrowdHeatmap';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  console.warn("VITE_GOOGLE_MAPS_KEY is missing from environment variables!");
}
const LIBRARIES = ['places', 'visualization'];

const KARUNYA_CENTER = { lat: 10.9355, lng: 76.7432 };

const LIGHT_STYLES = [
  { featureType: 'poi',         elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                                      stylers: [{ visibility: 'off' }] },
  { featureType: 'road',        elementType: 'geometry',         stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',        elementType: 'labels.text.fill', stylers: [{ color: '#888888' }] },
  { featureType: 'landscape',                                    stylers: [{ color: '#f5f5f0' }] },
  { featureType: 'water',                                        stylers: [{ color: '#a8d5e5' }] },
  { featureType: 'poi.park',    elementType: 'geometry',         stylers: [{ color: '#c5e8c5' }] },
];

const DARK_STYLES = [
  { elementType: 'geometry',                                     stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill',                             stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke',                           stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road',        elementType: 'geometry',         stylers: [{ color: '#2d3748' }] },
  { featureType: 'road',        elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road.highway',elementType: 'geometry',         stylers: [{ color: '#374151' }] },
  { featureType: 'water',                                        stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'landscape',                                    stylers: [{ color: '#111827' }] },
  { featureType: 'poi.park',    elementType: 'geometry',         stylers: [{ color: '#1a2e1a' }] },
  { featureType: 'poi',         elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                                      stylers: [{ visibility: 'off' }] },
];

const containerStyle = { width: '100%', height: '100%' };

const MapContainer = () => {
  const {
    theme, buildings, campusGeoJson,
    setMapRef, setIsSearchOpen,
    is3DMode, showSatellite,
    setSelectedBuilding, setSheetSnap, mapRef,
  } = useAppStore();

  // ── On map load, lock center on Karunya ──────────────────────
  const onLoad = useCallback((map) => {
    setMapRef(map);
    map.setCenter(KARUNYA_CENTER);
    map.setZoom(17);
    map.setMapTypeId('roadmap');
  }, [setMapRef]);

  const onUnmount = useCallback(() => setMapRef(null), [setMapRef]);

  // ── Satellite toggle ─────────────────────────────────────────
  useEffect(() => {
    if (!mapRef) return;
    mapRef.setMapTypeId(showSatellite ? 'hybrid' : 'roadmap');
  }, [showSatellite, mapRef]);

  // ── 3D tilt ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef) return;
    mapRef.setTilt(is3DMode ? 45 : 0);
  }, [is3DMode, mapRef]);

  const handleMapClick = useCallback(() => setIsSearchOpen(false), [setIsSearchOpen]);

  const formatLine = (coords) =>
    Array.isArray(coords) ? coords.map(([lng, lat]) => ({ lat, lng })) : [];

  const mapOptions = {
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    tilt: is3DMode ? 45 : 0,
    styles: showSatellite ? [] : (theme === 'dark' ? DARK_STYLES : LIGHT_STYLES),
    clickableIcons: false,
    minZoom: 13, maxZoom: 21,
    restriction: {
      latLngBounds: {
        north: 10.96, south: 10.91, east: 76.78, west: 76.70,
      },
      strictBounds: false,
    },
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={LIBRARIES} loadingElement={<MapSkeleton />}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={KARUNYA_CENTER}
        zoom={17}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* OSM walkways & footprints */}
        {campusGeoJson.features.map((f, i) => {
          if (!f.geometry) return null;
          if (f.geometry.type === 'LineString') return (
            <Polyline key={f.id || `l${i}`} path={formatLine(f.geometry.coordinates)}
              options={{ strokeColor: theme === 'dark' ? '#4a5568' : '#94a3b8', strokeOpacity: 0.65, strokeWeight: 2 }} />
          );
          if (f.geometry.type === 'Polygon' && f.geometry.coordinates?.[0]) return (
            <Polygon key={f.id || `p${i}`} paths={formatLine(f.geometry.coordinates[0])}
              options={{ fillColor: theme === 'dark' ? '#2d3748' : '#dbeafe', fillOpacity: 0.3, strokeColor: theme === 'dark' ? '#4a5568' : '#93c5fd', strokeWeight: 1 }} />
          );
          return null;
        })}

        {/* Building markers */}
        {buildings.map(b => (
          <BuildingMarker key={b.id} building={b}
            onClick={() => { setSelectedBuilding(b); setSheetSnap('half'); }} />
        ))}

        {/* Crowd heatmap dots */}
        <CrowdHeatmap />

        {/* GPS dot */}
        <UserLocationMarker />

        {/* Route polyline — self-managing via imperative Google Maps API */}
        <RouteOverlay />
      </GoogleMap>

      {/* Crowd legend (outside map, bottom-center) */}
      <CrowdLegend />
    </LoadScript>
  );
};

const MapSkeleton = () => (
  <div style={{
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', gap: 14,
  }}>
    <div style={{ width: 48, height: 48, border: '4px solid #1a73e8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', fontFamily: 'Inter, sans-serif' }}>
      Loading K-MAP…
    </div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
      Karunya Institute of Technology and Sciences
    </div>
  </div>
);

export default MapContainer;

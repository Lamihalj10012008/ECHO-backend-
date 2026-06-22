import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, Polygon, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';

const mapContainerStyle = { width: '100vw', height: '70vh', borderRadius: '8px' };
const karunyaCenter = { lat: 10.9355, lng: 76.7432 }; // Default campus focal point
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const localFallbackFeatures = [
  {
    "type": "Feature",
    "id": "fallback-1",
    "properties": { "name": "Living Star Ladies Hostel", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.7405665728673, 10.937006152615787] }
  },
  {
    "type": "Feature",
    "id": "fallback-2",
    "properties": { "name": "El-Shaddai Auditorium", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74166301063282, 10.937340305005051] }
  },
  {
    "type": "Feature",
    "id": "fallback-3",
    "properties": { "name": "Division of Artificial Intelligence and Machine Learning", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74151368408579, 10.936740114808487] }
  },
  {
    "type": "Feature",
    "id": "fallback-4",
    "properties": { "name": "Division of Data Science and Cyber Security", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74151368408579, 10.936740114808487] }
  },
  {
    "type": "Feature",
    "id": "fallback-5",
    "properties": { "name": "Nescafe", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74242156121407, 10.936951034326325] }
  },
  {
    "type": "Feature",
    "id": "fallback-6",
    "properties": { "name": "Cake World", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74220979728742, 10.93646760853388] }
  },
  {
    "type": "Feature",
    "id": "fallback-7",
    "properties": { "name": "Division of Electrical and Electronics Engineering", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74190908144882, 10.936287791959751] }
  },
  {
    "type": "Feature",
    "id": "fallback-8",
    "properties": { "name": "Division of Biotechnology", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74257254807894, 10.936327908082584] }
  },
  {
    "type": "Feature",
    "id": "fallback-9",
    "properties": { "name": "Division of Food Processing", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.7425668955256, 10.936040423372141] }
  },
  {
    "type": "Feature",
    "id": "fallback-10",
    "properties": { "name": "Rose Garden", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74198257546382, 10.93540472357731] }
  },
  {
    "type": "Feature",
    "id": "fallback-11",
    "properties": { "name": "Placement Training Centre/Computer Technology Centre", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74256327371815, 10.935238812740707] }
  },
  {
    "type": "Feature",
    "id": "fallback-12",
    "properties": { "name": "Central Library", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74334513763948, 10.935122938452066] }
  },
  {
    "type": "Feature",
    "id": "fallback-13",
    "properties": { "name": "Karunya Media Centre", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74336525421786, 10.934619938165469] }
  },
  {
    "type": "Feature",
    "id": "fallback-14",
    "properties": { "name": "Division of Computer science and Engineering", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74323595863329, 10.933640843902005] }
  },
  {
    "type": "Feature",
    "id": "fallback-15",
    "properties": { "name": "Canteen", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74377240042566, 10.933689564021895] }
  },
  {
    "type": "Feature",
    "id": "fallback-16",
    "properties": { "name": "Emmanuel Auditorium", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74492306809313, 10.933977934309752] }
  },
  {
    "type": "Feature",
    "id": "fallback-17",
    "properties": { "name": "Division of Aerospace Engineering", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74488685827214, 10.934417731359037] }
  },
  {
    "type": "Feature",
    "id": "fallback-18",
    "properties": { "name": "Division of Agriculture", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74398697714601, 10.934604710757682] }
  },
  {
    "type": "Feature",
    "id": "fallback-19",
    "properties": { "name": "Division of Civil Engineering", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74411706428533, 10.93505372416332] }
  },
  {
    "type": "Feature",
    "id": "fallback-20",
    "properties": { "name": "Elohim Auditorium", "building": "yes" },
    "geometry": { "type": "Point", "coordinates": [76.74500085215034, 10.935226218864155] }
  }
];

// Precision air distance engine logic
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos((lat1 * Math.PI)/180) * Math.cos((lat2 * Math.PI)/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export default function App() {
  const [campusGeoJson, setCampusGeoJson] = useState({ type: "FeatureCollection", features: [] });
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState("Hosur GPS Track Active"); // Secure default text if Geocoding is blocked
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [distanceToTarget, setDistanceToTarget] = useState(null);
  const [directions, setDirections] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const watchIdRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/campus-live')
      .then(res => {
        if (res.data && res.data.features && res.data.features.length > 0) {
          setCampusGeoJson(res.data);
        } else {
          setCampusGeoJson({ type: "FeatureCollection", features: localFallbackFeatures });
        }
        setLoading(false);
      })
      .catch(() => {
        setCampusGeoJson({ type: "FeatureCollection", features: localFallbackFeatures });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const currentPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(currentPos);

          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: currentPos }, (results, status) => {
              if (status === "OK" && results[0]) {
                setUserAddress(results[0].formatted_address);
              }
            });
          }
        },
        (err) => console.error("GPS tracking inactive", err),
        { enableHighAccuracy: true, distanceFilter: 5 }
      );
    }
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  // Updated to compute mathematical Haversine parameters if Billing drops the road engine
  useEffect(() => {
    if (!userLocation || !selectedLocation || !window.google) return;

    const coords = selectedLocation.geometry.coordinates;
    const isPoint = selectedLocation.geometry.type === "Point";
    const destLng = isPoint ? coords[0] : coords[0][0][0]; 
    const destLat = isPoint ? coords[1] : coords[0][0][1];

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: destLat, lng: destLng },
        travelMode: window.google.maps.TravelMode.DRIVING 
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setDistanceToTarget(result.routes[0].legs[0].distance.text);
        } else {
          // FAILSAFE LOGIC: Fall back to clear air metrics instantly if API returns REQUEST_DENIED
          console.warn("Directions API requires billing. Falling back to mathematical mapping line.");
          setDirections(null);
          const meters = getDistanceInMeters(userLocation.lat, userLocation.lng, destLat, destLng);
          setDistanceToTarget(meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters.toFixed(0)} meters`);
        }
      }
    );
  }, [userLocation, selectedLocation]);

  useEffect(() => {
    if (!userLocation || !selectedLocation) return;
    const coords = selectedLocation.geometry.coordinates;
    const isPoint = selectedLocation.geometry.type === "Point";
    const destLng = isPoint ? coords[0] : coords[0][0][0]; 
    const destLat = isPoint ? coords[1] : coords[0][0][1];

    const meters = getDistanceInMeters(userLocation.lat, userLocation.lng, destLat, destLng);
    if (meters <= 25) {
      alert(`🔔 Arrival Alert: You have arrived at ${selectedLocation.properties.name}!`);
      setSelectedLocation(null);
      setDirections(null);
      setDistanceToTarget(null);
      setSearchQuery('');
    }
  }, [userLocation, selectedLocation]);

  const formatPoints = (arr) => arr.map(([lng, lat]) => ({ lat, lng }));

  const searchablePlaces = campusGeoJson.features.filter(f => f.properties && f.properties.name);
  const filteredPlaces = searchablePlaces.filter(place =>
    place.properties.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract destination targets dynamically for fallback lines
  const getTargetCoordinates = () => {
    if (!selectedLocation) return null;
    const coords = selectedLocation.geometry.coordinates;
    const isPoint = selectedLocation.geometry.type === "Point";
    return {
      lat: isPoint ? coords[1] : coords[0][0][1],
      lng: isPoint ? coords[0] : coords[0][0][0]
    };
  };

  return (
    <div style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '15px', color: '#333' }}>
      <header style={{ background: '#1976d2', padding: '15px', borderRadius: '6px', color: '#fff', marginBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>📍 K-MAP: Live Karunya Navigator</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '13px' }}>Streaming Real-Time Campus Infrastructure & Walkways</p>
      </header>

      <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', borderLeft: '4px solid #1976d2' }}>
        🚩 <b>Current Location:</b> {userAddress}
      </div>

      <div style={{ position: 'relative', marginBottom: '20px', zIndex: 10 }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Search Campus Location:</label>
        <div style={{ display: 'flex', gap: '8px', maxWidth: '500px' }}>
          <input 
            type="text"
            placeholder="Type building, lab, or hostel name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{ padding: '12px', width: '100%', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedLocation(null); setDirections(null); setDistanceToTarget(null); }}
              style={{ padding: '0 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        {showSuggestions && searchQuery && (
          <ul style={{
            position: 'absolute', top: '100%', left: 0, right: 0, maxWidth: '500px',
            backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px',
            listStyleType: 'none', padding: 0, margin: '4px 0 0 0', zIndex: 1000,
            maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place, idx) => {
                const identifier = place.id || place.properties?.id || `search-id-${idx}`;
                return (
                  <li
                    key={identifier}
                    onClick={() => {
                      setSelectedLocation(place);
                      setSearchQuery(place.properties.name);
                      setShowSuggestions(false);
                    }}
                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <span>{place.properties.name}</span>
                    <span>{place.properties.building ? "🏢" : "🛣️"}</span>
                  </li>
                );
              })
            ) : (
              <li style={{ padding: '12px', color: '#777', fontStyle: 'italic', backgroundColor: '#fff' }}>No campus matches found</li>
            )}
          </ul>
        )}
      </div>

      {selectedLocation && (
        <div style={{ background: '#e8f5e9', borderLeft: '5px solid #2e7d32', padding: '12px', marginBottom: '15px', borderRadius: '4px' }}>
          Navigating to: <b>{selectedLocation.properties.name}</b> <br />
          Estimated Distance: <b>{distanceToTarget || 'Calculating parameters...'}</b>
        </div>
      )}

      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          mapContainerStyle={mapContainerStyle} 
          center={userLocation || karunyaCenter} 
          zoom={16}
          options={{ streetViewControl: false, mapTypeControl: true }}
          onClick={() => setShowSuggestions(false)}
        >
          {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: false }} />}

          {/* User Marker indicator falls into circle element if directions object is unavailable */}
          {userLocation && (
            <Marker 
              position={userLocation} 
              label="You" 
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 7,
                fillColor: '#1976d2',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }}
            />
          )}

          {/* Targets destination pin node explicitly under fallback profiles */}
          {selectedLocation && !directions && (
            <Marker position={getTargetCoordinates()} label="Target" />
          )}

          {/* Visual vector fallback link drawing an explicit direct navigation track line between vectors */}
          {userLocation && selectedLocation && !directions && (
            <Polyline 
              path={[userLocation, getTargetCoordinates()]}
              options={{ strokeColor: '#d32f2f', strokeOpacity: 0.9, strokeWeight: 4, geodesic: true }}
            />
          )}

          {!loading && !directions && campusGeoJson.features.map((feature, i) => {
            if (feature.geometry.type === "LineString") {
              return (
                <Polyline 
                  key={feature.id || i} 
                  path={formatPoints(feature.geometry.coordinates)} 
                  options={{ strokeColor: '#7986cb', strokeOpacity: 0.5, strokeWeight: 3 }} 
                />
              );
            }
            if (feature.geometry.type === "Polygon") {
              return (
                <Polygon 
                  key={feature.id || i} 
                  paths={formatPoints(feature.geometry.coordinates[0])} 
                  options={{ fillColor: '#9ccc65', fillOpacity: 0.25, strokeColor: '#7cb342', strokeWeight: 1 }} 
                />
              );
            }
            return null;
          })}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
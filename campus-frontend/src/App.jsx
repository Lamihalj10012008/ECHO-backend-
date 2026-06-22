import React, { useState } from 'react';
import HeroHeader from './components/HeroHeader';
import CampusMap from './components/CampusMap';
import RecommendationPanel from './components/RecommendationPanel';
import RecommendationResults from './components/RecommendationResults';
import LiveAnalytics from './components/LiveAnalytics';
import LocationExplorer from './components/LocationExplorer';
import AIInsights from './components/AIInsights';
import CampusDiscovery from './components/CampusDiscovery';
import useGeolocation from './hooks/useGeolocation';
import { FALLBACK_LOCATIONS } from './utils/constants';

export default function App() {
  const userLocation = useGeolocation();
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const handleRecommendationsLoaded = (data) => {
    setRecommendations(data);
  };

  return (
    <div className="echo-app">
      <HeroHeader />
      <CampusMap
        locations={FALLBACK_LOCATIONS}
        userLocation={userLocation}
        recommendations={recommendations}
      />
      <RecommendationPanel
        onRecommendationsLoaded={handleRecommendationsLoaded}
        userLocation={userLocation}
      />
      <RecommendationResults
        recommendations={recommendations}
        loading={recLoading}
      />
      <LiveAnalytics />
      <LocationExplorer locations={FALLBACK_LOCATIONS} />
      <AIInsights />
      <CampusDiscovery />
    </div>
  );
}
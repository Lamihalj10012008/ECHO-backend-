import useAppStore from '../stores/appStore';
import { navigationApi } from './apiService';
import { voiceService } from './voiceService';

// Karunya campus center — used as origin when user is off-campus
const CAMPUS_CENTER = { lat: 10.9355, lng: 76.7432 };

// Max distance from campus to trust GPS as the routing origin (5 km)
const MAX_CAMPUS_RADIUS_M = 5000;

const SPEEDS = { walking: 1.4, wheelchair: 0.8, bicycle: 4.0, running: 2.8 };

/** Haversine distance between two lat/lng points in metres */
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Resolve the routing origin.
 * - If GPS is within 5 km of campus → use real GPS
 * - Otherwise (user is far away / testing remotely) → use campus center
 */
const resolveOrigin = (userLocation) => {
  if (!userLocation) return CAMPUS_CENTER;
  const distFromCampus = haversine(
    userLocation.lat, userLocation.lng,
    CAMPUS_CENTER.lat, CAMPUS_CENTER.lng
  );
  return distFromCampus <= MAX_CAMPUS_RADIUS_M ? userLocation : CAMPUS_CENTER;
};

/** Format seconds into a human string like "5 min" or "2 hr 15 min" */
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} hr`;
};

/** Format metres into "350 m" or "1.2 km" */
const formatDistance = (metres) =>
  metres >= 1000
    ? `${(metres / 1000).toFixed(1)} km`
    : `${Math.round(metres)} m`;

export const routeService = {
  /**
   * Clear any existing route, then calculate a fresh one.
   * Always resolves origin relative to campus — never 229 km away.
   */
  async calculateRoute(destination) {
    const {
      userLocation, navigationMode,
      clearNavigation, setCurrentRoute, setNavState, setSheetSnap,
    } = useAppStore.getState();

    // ── BUG FIX 1: Always clear the previous route first ──────────
    clearNavigation();

    const origin = resolveOrigin(userLocation);
    const dest   = destination.coordinates;

    try {
      const res   = await navigationApi.getRoute(origin, destination.id, navigationMode);
      const route = res.data.route;
      setCurrentRoute(route);
      setNavState('route_preview');
      setSheetSnap('half');
      return route;
    } catch {
      // ── BUG FIX 2: Haversine now uses campus-relative origin ──────
      const distM      = haversine(origin.lat, origin.lng, dest.lat, dest.lng);
      const speed      = SPEEDS[navigationMode] || 1.4;
      const durationS  = Math.round(distM / speed);

      const fallback = {
        id:                   `fallback-${Date.now()}`,
        mode:                 navigationMode,
        origin,
        destination:          dest,
        destinationBuilding:  { id: destination.id, name: destination.name },
        distance: {
          meters: Math.round(distM),
          text:   formatDistance(distM),
        },
        duration: {
          seconds: durationS,
          text:    formatDuration(durationS),
        },
        eta: new Date(Date.now() + durationS * 1000).toISOString(),
        steps: [
          {
            index: 0, maneuver: 'depart',
            instruction: `Head toward ${destination.name}`,
            distance: { text: formatDistance(distM) },
          },
          {
            index: 1, maneuver: 'arrive',
            instruction: `Arrive at ${destination.name}`,
            distance: { text: '0 m' },
          },
        ],
        polyline: [origin, dest],
      };

      setCurrentRoute(fallback);
      setNavState('route_preview');
      setSheetSnap('half');
      return fallback;
    }
  },

  /** Start active turn-by-turn navigation */
  startNavigation() {
    const { navState, currentRoute, setNavState, setSheetSnap, isVoiceNavEnabled, language } =
      useAppStore.getState();
    if (navState !== 'route_preview' || !currentRoute) return;
    setNavState('navigating');
    setSheetSnap('peek');
    if (isVoiceNavEnabled) {
      const first = currentRoute.steps?.[0];
      if (first) voiceService.speak(first.instruction, language);
    }
  },

  /**
   * Stop / cancel navigation and CLEAR the blue route line.
   * Called by: Stop button, X button, new search selection.
   */
  stopNavigation() {
    const { clearNavigation, setSheetSnap, clearSelectedBuilding } = useAppStore.getState();
    clearNavigation();           // sets navState='idle', currentRoute=null
    clearSelectedBuilding();     // hides bottom sheet content
    setSheetSnap('closed');
    voiceService.stop();
  },

  /** Recalculate when user is off-route */
  async recalculate() {
    const {
      userLocation, currentRoute, navigationMode,
      setCurrentRoute, setIsOffRoute, isVoiceNavEnabled, language,
    } = useAppStore.getState();
    if (!userLocation || !currentRoute) return;
    try {
      const destId = currentRoute.destinationBuilding?.id;
      const res    = await navigationApi.reroute(userLocation, destId, navigationMode, 'off_route');
      setCurrentRoute(res.data.route);
      setIsOffRoute(false);
      if (isVoiceNavEnabled) voiceService.speak('Route recalculated', language);
    } catch {
      setIsOffRoute(false);
    }
  },

  formatETA(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },
};

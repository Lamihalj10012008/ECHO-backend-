import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import '../styles/variables.css';
import useAppStore from '../stores/appStore';
import useGPS from '../hooks/useGPS';
import { campusApi } from '../services/apiService';
import { routeService } from '../services/routeService';
import { voiceService } from '../services/voiceService';

import MapContainer from './map/MapContainer';
import SearchBar from './search/SearchBar';
import BottomSheet from './navigation/BottomSheet';
import NavigationBanner from './navigation/NavigationBanner';
import FloatingActionButtons from './ui/FloatingActionButtons';
import MapControls from './ui/MapControls';
import AIAssistant from './ai/AIAssistant';
import EmergencyPanel from './ui/EmergencyPanel';

export default function KMapApp() {
  const {
    theme, setBuildings, setCampusGeoJson,
    navState, setNavState, currentRoute,
    isOffRoute, isVoiceNavEnabled, language,
    locationError, clearNavigation, setSheetSnap,
  } = useAppStore();

  /* ── Theme on DOM ─────────────────────────────────────────── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'dark' ? '#0f172a' : '#f1f5f9';
  }, [theme]);

  /* ── GPS ──────────────────────────────────────────────────── */
  useGPS();

  /* ── Fetch buildings (cached 1h) ──────────────────────────── */
  const { data: bldData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => campusApi.getBuildings().then(r => r.data),
    staleTime: 60 * 60 * 1000,
    retry: 3,
  });
  useEffect(() => {
    if (bldData?.buildings) setBuildings(bldData.buildings);
  }, [bldData, setBuildings]);

  /* ── Fetch OSM live data (cached 10min) ───────────────────── */
  const { data: osmData } = useQuery({
    queryKey: ['campus-live'],
    queryFn: () => campusApi.getLiveData().then(r => r.data),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  useEffect(() => {
    if (osmData?.features?.length > 0) setCampusGeoJson(osmData);
  }, [osmData, setCampusGeoJson]);

  /* ── GPS error toast ──────────────────────────────────────── */
  useEffect(() => {
    if (locationError) {
      toast.error(`📍 ${locationError}`, { id: 'gps-err', duration: 6000 });
    }
  }, [locationError]);

  /* ── Off-route recalculation ──────────────────────────────── */
  useEffect(() => {
    if (isOffRoute && navState === 'navigating') {
      routeService.recalculate();
      if (isVoiceNavEnabled) voiceService.announce('off_route', language);
    }
  }, [isOffRoute]);

  /* ── Arrival ──────────────────────────────────────────────── */
  useEffect(() => {
    if (navState === 'arrived') {
      const dest = currentRoute?.destinationBuilding?.name || 'your destination';
      toast.success(`🎉 Arrived at ${dest}!`, { duration: 4000 });
      if (isVoiceNavEnabled) voiceService.announce('arrived', language, dest);
      const t = setTimeout(() => { clearNavigation(); setSheetSnap('closed'); }, 3500);
      return () => clearTimeout(t);
    }
  }, [navState]);

  const isNavigating = navState === 'navigating';

  return (
    <div style={{
      width: '100vw', height: '100dvh',   /* dvh handles mobile chrome bar */
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, Roboto, system-ui, sans-serif',
    }}>
      {/* ① Full-screen map base */}
      <MapContainer />

      {/* ② Navigation banner (top) — above map */}
      <AnimatePresence>
        {isNavigating && <NavigationBanner />}
      </AnimatePresence>

      {/* ③ Search bar (top-center) — hidden while navigating */}
      {!isNavigating && <SearchBar />}

      {/* ④ Left controls: accessibility + 3D */}
      <MapControls />

      {/* ⑤ Right FAB cluster */}
      <FloatingActionButtons />

      {/* ⑥ AI assistant (bottom-left bubble + panel) */}
      <AIAssistant />

      {/* ⑦ Bottom sheet */}
      <AnimatePresence mode="wait">
        <BottomSheet />
      </AnimatePresence>

      {/* ⑧ Emergency modal */}
      <EmergencyPanel />

      {/* ⑨ Arrived celebration overlay */}
      <AnimatePresence>
        {navState === 'arrived' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', zIndex: 60,
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: 2 }}
              style={{
                background: '#ffffff',
                borderRadius: 24, padding: '36px 48px',
                textAlign: 'center',
                boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>You've Arrived!</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                {currentRoute?.destinationBuilding?.name}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⑩ Toast notifications */}
      <Toaster
        position="top-center"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: 12,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            padding: '10px 16px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

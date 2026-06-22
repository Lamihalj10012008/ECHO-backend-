import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, AlertTriangle } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { routeService } from '../../services/routeService';

const EMERGENCY_ITEMS = [
  {
    id: 'medical', label: 'Medical Centre', icon: '🏥', color: '#ef4444',
    phone: '0422-2614300', desc: '24×7 Campus Doctors & Emergency Room',
    buildingId: 'bld-025',
  },
  {
    id: 'security', label: 'Campus Security', icon: '🛡️', color: '#f59e0b',
    phone: '0422-2614200', desc: '24×7 Campus Security Control Room',
    buildingId: 'bld-026',
  },
  {
    id: 'ambulance', label: 'Ambulance', icon: '🚑', color: '#ef4444',
    phone: '108', desc: 'National Ambulance Service — Free',
    buildingId: null,
  },
  {
    id: 'fire', label: 'Fire Emergency', icon: '🔥', color: '#ea580c',
    phone: '101', desc: 'Fire Department Emergency Line',
    buildingId: null,
  },
];

const EmergencyPanel = () => {
  const { isEmergencyPanelOpen, setIsEmergencyPanelOpen, buildings, setSelectedBuilding, setSheetSnap } = useAppStore();

  const handleNavigateTo = (buildingId) => {
    if (!buildingId) return;
    const building = buildings.find(b => b.id === buildingId);
    if (building) {
      setSelectedBuilding(building);
      setSheetSnap('half');
      routeService.calculateRoute(building);
      setIsEmergencyPanelOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isEmergencyPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsEmergencyPanelOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 49,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(400px, calc(100vw - 32px))',
              background: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              zIndex: 50,
              overflow: 'hidden',
              border: '2px solid #fecaca',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <AlertTriangle size={22} color="#fff" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Emergency Assistance</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>Tap to call or navigate</div>
              </div>
              <button onClick={() => setIsEmergencyPanelOpen(false)} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div style={{ padding: '10px 12px 14px' }}>
              {EMERGENCY_ITEMS.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 10px', borderRadius: 12,
                  marginBottom: 6, border: '1px solid #f3f4f6',
                  background: '#fafafa',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `${item.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, border: `1px solid ${item.color}25`,
                  }}>
                    {item.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4, marginTop: 1 }}>{item.desc}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                    <a href={`tel:${item.phone}`} style={{
                      background: item.color, color: '#fff',
                      borderRadius: 8, padding: '5px 10px',
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                      <Phone size={11} /> {item.phone}
                    </a>
                    {item.buildingId && (
                      <button onClick={() => handleNavigateTo(item.buildingId)} style={{
                        background: '#eff6ff', color: '#1a73e8',
                        border: '1px solid #bfdbfe',
                        borderRadius: 8, padding: '5px 10px',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        whiteSpace: 'nowrap',
                      }}>
                        <MapPin size={10} /> Navigate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyPanel;

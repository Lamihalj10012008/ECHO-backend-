# ECHO SOS Alert System - Component Documentation

## Components Overview

### 1. Navbar Component
**File**: `src/components/Navbar.jsx`

Top navigation bar with brand logo, notifications, theme toggle, and user menu.

**Props**: 
- `onMenuClick` (function): Callback when menu button is clicked

**Features**:
- Notification badge with unread count
- Dark/Light mode toggle
- Settings button
- Responsive design (mobile menu)
- Sticky positioning

**Usage**:
```jsx
<Navbar onMenuClick={handleMenuClick} />
```

---

### 2. Sidebar Component
**File**: `src/components/Sidebar.jsx`

Collapsible navigation menu with links to all pages.

**Props**:
- `open` (boolean): Sidebar visibility state
- `setOpen` (function): Callback to toggle sidebar

**Features**:
- Responsive (full-width on mobile, sidebar on desktop)
- Active page highlighting
- Campus emergency hotline display
- Smooth animations

**Navigation Items**:
- Dashboard
- SOS Alert
- Emergency Tracking
- Emergency Contacts
- Notifications
- History
- Settings

---

### 3. SOSButton Component
**File**: `src/components/SOSButton.jsx`

Main emergency activation button with 3-second long-press functionality.

**Props**:
- `onPress` (function, optional): Callback when SOS is activated
- `emergencyType` (string, default: 'Other'): Type of emergency

**Features**:
- 3-second press requirement with visual countdown
- Progress ring animation
- Sound and vibration feedback
- Visual status indicators
- Pulsing background rings during press
- Auto location capture

**States**:
- Idle
- Pressing (with percentage indicator)
- Activated (success state)

**Usage**:
```jsx
<SOSButton 
  emergencyType="medical" 
  onPress={(alert) => handleAlert(alert)} 
/>
```

**Styling**: Large 128x128px button with gradient red background

---

### 4. EmergencyTypeSelector Component
**File**: `src/components/EmergencyTypeSelector.jsx`

Grid of emergency type buttons for selection.

**Props**:
- `selected` (string): Currently selected emergency type ID
- `onChange` (function): Callback when selection changes

**Emergency Types**:
- Medical Emergency (🏥) - Blue
- Harassment (⚠️) - Orange
- Accident (🚗) - Yellow
- Fire Emergency (🔥) - Red
- Theft (🔓) - Purple
- Other (❓) - Gray

**Features**:
- Grid layout (2 columns on mobile, 3 on desktop)
- Color-coded buttons
- Active state highlighting
- Icon and label display

**Usage**:
```jsx
<EmergencyTypeSelector 
  selected="medical" 
  onChange={(type) => setEmergencyType(type)} 
/>
```

---

### 5. ContactCard Component
**File**: `src/components/ContactCard.jsx`

Individual emergency contact display with call and WhatsApp buttons.

**Props**:
- `contact` (object): Contact data with name, phone, whatsapp, icon
- `onCall` (function): Callback when call button clicked
- `onWhatsApp` (function): Callback when WhatsApp button clicked

**Contact Object Structure**:
```javascript
{
  id: 1,
  name: "Parent",
  phone: "+91-9876543210",
  whatsapp: "+91-9876543210",
  icon: "👨‍👩‍👧"
}
```

**Features**:
- Contact icon and name display
- Phone number display
- Call button (initiates tel: link)
- WhatsApp button (opens WhatsApp Web/App)
- Responsive button layout

**Usage**:
```jsx
<ContactCard 
  contact={contact} 
  onCall={handleCall} 
  onWhatsApp={handleWhatsApp} 
/>
```

---

### 6. NotificationCard Component
**File**: `src/components/NotificationCard.jsx`

Individual notification display with read/unread state.

**Props**:
- `notification` (object): Notification data
- `onRead` (function): Callback to mark as read
- `onDismiss` (function): Callback to dismiss

**Notification Object Structure**:
```javascript
{
  id: "notif_123",
  type: "alert_update",
  title: "Security Assigned",
  message: "Officer assigned to your emergency",
  timestamp: "2024-06-11T10:31:00Z",
  read: false,
  icon: "👮"
}
```

**Features**:
- Icon display based on notification type
- Title and message
- Timestamp with relative formatting (e.g., "5m ago")
- Unread indicator dot
- Dismiss button
- Hover effects

**Notification Types**:
- parent_notified (👨‍👩‍👧)
- guardian_notified (👴)
- security_notified (👮)
- hospital_notified (🏥)
- police_notified (🚔)
- resolved (✅)
- status_update (📌)
- alert_created (🚨)

---

### 7. LocationMap Component
**File**: `src/components/LocationMap.jsx`

GPS location display with map integration options.

**Props**:
- `location` (object): Location data with lat, lon, accuracy
- `loading` (boolean): Loading state
- `onRefresh` (function): Callback to refresh location

**Location Object Structure**:
```javascript
{
  latitude: 28.5356,
  longitude: 77.3910,
  accuracy: 10,
  timestamp: "2024-06-11T10:30:00Z",
  address: "Campus Main Gate"
}
```

**Features**:
- Latitude display (6 decimal precision)
- Longitude display (6 decimal precision)
- Accuracy radius indicator
- Reverse geocoded address display
- Google Maps integration button
- OpenStreetMap integration button
- Loading spinner
- Refresh button with disabled state during loading

**Usage**:
```jsx
<LocationMap 
  location={location} 
  loading={loading} 
  onRefresh={getCurrentLocation} 
/>
```

---

### 8. EmergencyTimeline Component
**File**: `src/components/EmergencyTimeline.jsx`

Visual timeline of emergency response stages.

**Props**:
- `timeline` (array): Array of timeline events
- `currentStatus` (string): Current emergency status

**Event Object Structure**:
```javascript
{
  status: "Alert Created",
  timestamp: "2024-06-11T10:30:00Z",
  icon: "🚨",
  message: "Emergency alert created"
}
```

**Features**:
- Vertical timeline layout
- Color-coded status dots
- Timestamp display
- Event message display
- Completed/pending visual distinction
- Pulse animation on current event

**Status Styling**:
- Created: Yellow
- Security Assigned: Blue
- Help On The Way: Orange
- Arrived: Green
- Resolved: Dark Green

---

### 9. StatusTracker Component
**File**: `src/components/StatusTracker.jsx`

Progress bar showing emergency response status stages.

**Props**:
- `alert` (object): Alert object with status and timeline

**Features**:
- 5-stage progress visualization
- Color-coded progress indicators
- Checkmark for completed stages
- Current status highlight
- Status description below each stage
- Animated progress bar

**Stages**:
1. Alert Created (🚨)
2. Security Assigned (👮)
3. Help On The Way (🚗)
4. Help Arrived (✅)
5. Resolved (🎯)

**Usage**:
```jsx
<StatusTracker alert={currentAlert} />
```

---

### 10. EmergencyHistoryTable Component
**File**: `src/components/EmergencyHistoryTable.jsx`

Expandable table showing past emergency incidents.

**Props**:
- `alerts` (array): Array of alert objects

**Features**:
- Expandable rows for detailed info
- Emergency type icon display
- Date and time formatting
- Status badge display
- Location information
- Timeline events in expanded view
- Responsive design
- Smooth animations

**Expandable Content**:
- Complete location (address + coordinates)
- Priority level
- All timeline events
- Response times

**Usage**:
```jsx
<EmergencyHistoryTable alerts={alerts} />
```

---

## Context Hooks

### useAlert()
**File**: `src/context/AlertContext.jsx`

Provides alert state and management functions.

**Available Methods**:
```javascript
const {
  alerts,                      // Array of all alerts
  currentAlert,               // Current active alert
  setCurrentAlert,            // Set current alert
  notifications,              // Array of notifications
  emergencyContacts,          // Array of emergency contacts
  createAlert,                // Function to create alert
  updateAlertStatus,          // Function to update status
  addNotification,            // Function to add notification
  markNotificationAsRead      // Function to mark as read
} = useAlert()
```

---

### useLocation()
**File**: `src/context/LocationContext.jsx`

Provides location services and GPS functionality.

**Available Methods**:
```javascript
const {
  location,                   // Current location object
  loading,                    // Loading state
  error,                      // Error message
  locationHistory,            // Array of location updates
  getCurrentLocation,         // Function to get current location
  watchLocation,              // Function to watch location
  stopWatchingLocation,       // Function to stop watching
  getMapUrl                   // Function to get map URL
} = useLocation()
```

---

### useTheme()
**File**: `src/context/ThemeContext.jsx`

Provides theme management (dark/light mode).

**Available Methods**:
```javascript
const {
  isDark,                     // Current theme (boolean)
  toggleTheme                 // Function to toggle theme
} = useTheme()
```

---

## API Service Functions

**File**: `src/services/api.js`

### sosAPI
```javascript
sosAPI.createAlert(alertData)           // POST /api/sos/alert
sosAPI.getAlerts(params)                // GET /api/sos/alerts
sosAPI.getAlert(alertId)                // GET /api/sos/alerts/:id
sosAPI.updateAlertStatus(alertId, status) // PUT /api/sos/alerts/:id/status
sosAPI.cancelAlert(alertId)             // POST /api/sos/alerts/:id/cancel
sosAPI.getAlertTimeline(alertId)        // GET /api/sos/alerts/:id/timeline
```

### notificationAPI
```javascript
notificationAPI.getNotifications(params)    // GET /api/notifications
notificationAPI.markAsRead(notificationId)  // PUT /api/notifications/:id/read
notificationAPI.markAllAsRead()             // PUT /api/notifications/read-all
notificationAPI.deleteNotification(id)      // DELETE /api/notifications/:id
```

### locationAPI
```javascript
locationAPI.updateLocation(alertId, location)  // POST /api/sos/alerts/:id/location
locationAPI.getLocationHistory(alertId)        // GET /api/sos/alerts/:id/location-history
```

### contactsAPI
```javascript
contactsAPI.getContacts()                      // GET /api/emergency-contacts
contactsAPI.updateContact(contactId, data)     // PUT /api/emergency-contacts/:id
contactsAPI.notifyContact(contactId, alertId)  // POST /api/emergency-contacts/:id/notify
```

### analyticsAPI
```javascript
analyticsAPI.getEmergencyStats()               // GET /api/analytics/stats
analyticsAPI.getEmergencyHistory(params)       // GET /api/analytics/history
```

---

## Styling System

### Global Classes

**Cards**:
```css
.card {
  @apply bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-red-600/50 transition-all duration-200;
}
```

**Buttons**:
```css
.btn-primary {
  @apply px-4 py-2 bg-red-600 text-white hover:bg-red-700;
}

.btn-secondary {
  @apply px-4 py-2 bg-dark-700 text-gray-200 hover:bg-dark-600;
}

.btn-ghost {
  @apply px-4 py-2 bg-transparent text-gray-300 hover:bg-dark-700;
}

.btn-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center hover:bg-dark-700;
}
```

**Badges**:
```css
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
}

.badge-red {
  @apply bg-red-600/20 text-red-400;
}

.badge-green {
  @apply bg-green-600/20 text-green-400;
}
```

---

## Best Practices

1. **Always handle loading states** in async operations
2. **Use context hooks** for shared state instead of prop drilling
3. **Implement error boundaries** for crash prevention
4. **Memoize expensive computations** with useMemo
5. **Use useCallback** for event handlers passed to children
6. **Keep components focused** and single-responsibility
7. **Use semantic HTML** for accessibility
8. **Test responsive design** on actual devices
9. **Optimize images** and assets
10. **Monitor performance** with browser DevTools

---

## Component Tree

```
App
├── Navbar
├── Sidebar
└── MainContent
    ├── Dashboard
    │   ├── EmergencyHistoryTable
    │   └── SafetyTips
    ├── SOSAlert
    │   ├── SOSButton
    │   ├── EmergencyTypeSelector
    │   ├── LocationMap
    │   └── ContactCard[]
    ├── EmergencyTracking
    │   ├── StatusTracker
    │   ├── EmergencyTimeline
    │   ├── LocationMap
    │   └── PersonnelCard[]
    ├── EmergencyContacts
    │   └── ContactCard[]
    ├── NotificationCenter
    │   └── NotificationCard[]
    ├── EmergencyHistory
    │   └── EmergencyHistoryTable
    └── Settings
```

---

## Last Updated
June 2024 | Version 1.0.0

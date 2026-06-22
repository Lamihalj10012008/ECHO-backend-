# ECHO - SOS Alert System

A modern, responsive emergency alert system frontend for university campuses. Built with React.js, this application provides a comprehensive platform for students to quickly report emergencies and get help from campus security and medical teams.

## 🚨 Features

### Core Emergency Features
- **One-Press SOS Activation** - 3-second long-press to activate emergency alerts
- **Emergency Type Selection** - Medical, Harassment, Accident, Fire, Theft, Other
- **Real-Time GPS Integration** - Automatic location capture and sharing
- **Emergency Tracking** - Live tracking of response status
- **Contact Notifications** - Automatically notify parents, guardians, and security

### User Interface
- **Dark Mode Support** - Eye-friendly dark theme with emergency red highlights
- **Mobile-First Design** - Fully responsive on all devices
- **Card-Based Dashboard** - Modern, clean interface
- **Real-Time Timeline** - Visual emergency response timeline
- **Status Tracker** - Visual progress indicator for emergency response

### Emergency Management
- **Emergency History** - View all past incidents with detailed logs
- **Contact Management** - Manage emergency contacts easily
- **Notification Center** - Real-time alerts and updates
- **Settings Management** - Customize preferences and privacy

### Advanced Features
- **Voice SOS Recognition** - Activate SOS with voice commands (SOS, Help Me, Emergency)
- **Browser Notifications** - Push notifications for emergency updates
- **Live Location Updates** - Continuous location tracking during emergencies
- **Emergency Timeline** - Visual timeline of all emergency response stages
- **Safety Recommendations** - First aid tips and safety guidance

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **State Management**: Context API + Custom Hooks
- **HTTP Client**: Axios 1.6.2
- **Styling**: Tailwind CSS 3.3.6
- **Icons**: React Icons 4.12.0
- **Real-Time**: Socket.IO Client 4.5.4
- **Notifications**: React Toastify 10.0.3
- **Build Tool**: Vite 5.0.8

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── SOSButton.jsx
│   ├── EmergencyTypeSelector.jsx
│   ├── ContactCard.jsx
│   ├── NotificationCard.jsx
│   ├── LocationMap.jsx
│   ├── EmergencyTimeline.jsx
│   ├── StatusTracker.jsx
│   └── EmergencyHistoryTable.jsx
├── pages/               # Page components
│   ├── Dashboard.jsx
│   ├── SOSAlert.jsx
│   ├── EmergencyTracking.jsx
│   ├── EmergencyContacts.jsx
│   ├── NotificationCenter.jsx
│   ├── EmergencyHistory.jsx
│   └── Settings.jsx
├── context/             # Context API for state management
│   ├── AlertContext.jsx
│   ├── LocationContext.jsx
│   └── ThemeContext.jsx
├── services/            # API services
│   └── api.js
├── App.jsx              # Root application component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
cd c:\Users\HP\Desktop\ECHO
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env.local
```

4. Update environment variables
```env
VITE_API_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📱 Pages and Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main overview and quick access |
| `/sos` | SOS Alert | Emergency alert activation |
| `/tracking` | Emergency Tracking | Real-time response tracking |
| `/contacts` | Emergency Contacts | Manage emergency contacts |
| `/notifications` | Notification Center | View all notifications |
| `/history` | Emergency History | Past incidents log |
| `/settings` | Settings | User preferences |

## 🎨 UI Components

### SOSButton
- Large floating emergency button
- 3-second long-press activation
- Visual countdown with progress ring
- Sound and vibration feedback
- Haptic response on activation

### LocationMap
- Real-time GPS location display
- Latitude and longitude precision
- Accuracy radius indicator
- Google Maps and OpenStreetMap integration
- One-click map opening

### EmergencyTimeline
- Visual timeline of all events
- Status indicators with icons
- Timestamp for each event
- Color-coded status levels

### StatusTracker
- Progress bar visualization
- 5-stage emergency response tracking
- Current status highlight
- Visual completion indicators

### ContactCard
- Contact information display
- Direct calling functionality
- WhatsApp messaging integration
- Customizable contact details
- Icon-based identification

## 🔧 API Integration

The application integrates with the following API endpoints:

### Emergency Alerts
```
POST   /api/sos/alert              - Create new emergency alert
GET    /api/sos/alerts             - Get all alerts
GET    /api/sos/alerts/:id         - Get specific alert
PUT    /api/sos/alerts/:id/status  - Update alert status
```

### Notifications
```
GET    /api/notifications          - Get all notifications
PUT    /api/notifications/:id/read - Mark as read
```

### Location
```
POST   /api/sos/alerts/:id/location - Update location
GET    /api/sos/alerts/:id/location-history - Location history
```

### Contacts
```
GET    /api/emergency-contacts     - Get contacts
PUT    /api/emergency-contacts/:id - Update contact
POST   /api/emergency-contacts/:id/notify - Notify contact
```

## 🎯 Key Features Implementation

### GPS Location Services
- Uses browser Geolocation API
- Automatic location capture on alert
- Real-time location tracking option
- Reverse geocoding using OpenStreetMap Nominatim API
- Accuracy radius indicator

### Voice SOS
- Browser Web Speech Recognition API
- Trigger phrases: "SOS", "Help Me", "Emergency"
- Voice confirmation for accessibility
- Browser support: Chrome, Edge, Safari

### Notifications
- React Toastify for toast notifications
- Browser Notification API support
- Real-time updates with Socket.IO ready
- Multiple notification types and statuses

### Emergency Timeline
- Automatic event logging
- Timestamp recording
- Status-based icon display
- Event message support
- Visual progress indication

## 🔒 Security Features

- HTTPS-ready API client
- Authorization token handling
- User authentication support
- Location data encryption (ready)
- Contact information protection
- Sensitive data handling

## 📊 Emergency Tracking

The system tracks emergencies through these stages:
1. **Alert Created** - Emergency alert activated
2. **Security Assigned** - Campus security assigned
3. **Help On The Way** - Emergency response en route
4. **Arrived** - Help has reached the location
5. **Resolved** - Emergency successfully resolved

## 🌐 Responsive Design

- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Full tablet support (768px+)
- **Desktop**: Complete desktop experience (1024px+)
- Flexbox and grid layouts
- Touch-friendly button sizes
- Hamburger menu for mobile navigation

## 🎨 Color Scheme

- **Primary Red**: `#dc2626` - Emergency/Critical actions
- **Dark Gray**: `#1f2937` - Background
- **White**: Emergency text and borders
- **Accent**: Green (success), Orange (warning), Blue (info), Yellow (alert)

## 📝 Environment Variables

Create a `.env.local` file with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_GPS=true
VITE_ENABLE_VOICE_SOS=true
VITE_ENABLE_SOCKET_IO=true

# Map Provider
VITE_MAP_PROVIDER=openstreetmap

# Notification Timeout
VITE_NOTIFICATION_TIMEOUT=3000
```

## 🐛 Troubleshooting

### Location Not Working
- Enable location services in browser
- Check browser permissions
- Ensure HTTPS in production
- Verify Geolocation API support

### Notifications Not Showing
- Check notification permissions
- Verify browser support
- Check React Toastify configuration
- Review browser console for errors

### Styling Issues
- Clear node_modules and reinstall
- Rebuild Tailwind CSS
- Check browser cache
- Verify Tailwind config

## 📚 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Mobile browsers: Full support

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the ECHO Smart Campus Platform.

## 🆘 Support

For issues or questions:
- Campus Security: 100
- Emergency: 911
- Support Email: support@echo.campus
- Issue Tracker: GitHub Issues

## 🗺️ Emergency Services Reference

| Service | Contact | Status |
|---------|---------|--------|
| Campus Security | 100 | 24/7 |
| Medical Unit | 102 | 24/7 |
| Fire Safety | 101 | 24/7 |
| Counselor | 103 | Business Hours |

---

**Last Updated**: June 2024
**Version**: 1.0.0
**Status**: Production Ready

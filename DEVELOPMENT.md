# ECHO SOS Alert System - Development Guide

## Quick Start

### 1. Installation & Setup
```bash
cd c:\Users\HP\Desktop\ECHO
npm install
cp .env.example .env.local
```

### 2. Start Development Server
```bash
npm run dev
```
The app will open at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
npm run preview
```

## Project Structure

### `/src/components/` - Reusable Components
- **Navbar** - Top navigation bar with notifications and settings
- **Sidebar** - Navigation menu (responsive, collapsible on mobile)
- **SOSButton** - Main emergency button with 3-second press
- **EmergencyTypeSelector** - Emergency type selection UI
- **ContactCard** - Emergency contact display with call/WhatsApp buttons
- **NotificationCard** - Individual notification display
- **LocationMap** - GPS location display and map integration
- **EmergencyTimeline** - Timeline visualization of emergency events
- **StatusTracker** - Progress tracker for emergency response stages
- **EmergencyHistoryTable** - Expandable emergency history table

### `/src/pages/` - Page Components
- **Dashboard** - Main overview page with quick actions
- **SOSAlert** - Emergency alert creation and activation
- **EmergencyTracking** - Real-time tracking of active emergency
- **EmergencyContacts** - Contact management and calling
- **NotificationCenter** - Centralized notification management
- **EmergencyHistory** - Complete incident history with filtering
- **Settings** - User preferences and account settings

### `/src/context/` - State Management
- **AlertContext** - Emergency alerts and notifications state
- **LocationContext** - GPS location and geolocation state
- **ThemeContext** - Dark/Light mode preference

### `/src/services/` - API Integration
- **api.js** - Axios instance with interceptors and all API endpoints

## Key Features Development Guide

### Adding New API Endpoints

In `src/services/api.js`:
```javascript
export const newAPI = {
  getResource: (params = {}) => 
    apiClient.get('/resource', { params }),
  
  createResource: (data) => 
    apiClient.post('/resource', data),
}
```

### Adding New Pages

1. Create component in `/src/pages/NewPage.jsx`
2. Add route in `App.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```
3. Add to Sidebar navigation in `Sidebar.jsx`

### Using Context

```javascript
import { useAlert } from '../context/AlertContext'

const MyComponent = () => {
  const { alerts, createAlert } = useAlert()
  // Use context
}
```

### Adding Notifications

```javascript
import { toast } from 'react-toastify'

toast.success('Success message')
toast.error('Error message')
toast.info('Info message')
toast.warning('Warning message')
```

### Location Services

```javascript
import { useLocation } from '../context/LocationContext'

const MyComponent = () => {
  const { location, loading, getCurrentLocation, getMapUrl } = useLocation()
  
  useEffect(() => {
    getCurrentLocation()
  }, [])
}
```

## Styling Guide

### Tailwind CSS Classes

**Card Component:**
```jsx
<div className="card">
  Content here
</div>
```

**Buttons:**
```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-icon">Icon Button</button>
```

**Badges:**
```jsx
<span className="badge badge-red">Red Badge</span>
<span className="badge badge-green">Green Badge</span>
<span className="badge badge-blue">Blue Badge</span>
<span className="badge badge-yellow">Yellow Badge</span>
```

**Color Palette:**
- Red (Emergency): `text-red-600`, `bg-red-600`
- Dark: `bg-dark-800`, `bg-dark-700`
- Gray: `text-gray-400`, `text-gray-500`

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_GPS=true
VITE_ENABLE_VOICE_SOS=true
VITE_ENABLE_SOCKET_IO=true

# Map Provider
VITE_MAP_PROVIDER=openstreetmap

# Notification
VITE_NOTIFICATION_TIMEOUT=3000
```

## Common Tasks

### Debugging

1. **Check Console**: `F12` or `Ctrl+Shift+I`
2. **React DevTools**: Install from browser extensions
3. **Network Tab**: Check API calls
4. **Application Tab**: Check localStorage

### Styling Issues

1. Clear Tailwind cache: `rm -rf node_modules/.cache`
2. Rebuild: `npm run build`
3. Check if Tailwind classes are in config

### Location Services Issues

1. Enable location in browser settings
2. Check HTTPS (production only)
3. Verify Geolocation API support
4. Check console for permission errors

### API Integration

1. Verify API URL in `.env.local`
2. Check CORS headers on backend
3. Verify authentication token in localStorage
4. Check network tab for request/response

## Testing Checklist

- [ ] Desktop responsiveness (1920px, 1366px, 1024px)
- [ ] Tablet responsiveness (768px, 834px)
- [ ] Mobile responsiveness (375px, 414px, 480px)
- [ ] SOS button activation (3-second press)
- [ ] Location services (GPS capture)
- [ ] Contact notifications (Call, WhatsApp)
- [ ] Toast notifications (all types)
- [ ] Dark mode toggle
- [ ] Emergency tracking updates
- [ ] Navigation between pages
- [ ] Form inputs and validation
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

## Performance Optimization Tips

1. **Code Splitting**: Routes are already split via React Router
2. **Lazy Loading**: Can implement for heavy components
3. **Image Optimization**: Use emoji instead of images
4. **API Caching**: Implement in context where appropriate
5. **Bundle Size**: Monitor with `npm run build`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting Common Issues

### npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Build fails with module errors
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear Vite cache: `rm -rf dist .vite`

### Styling not applying
- Check if Tailwind classes exist in config
- Restart dev server: `npm run dev`
- Check browser cache: `Ctrl+Shift+Delete`

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create Pull Request
```

## Deployment

### Build
```bash
npm run build
```

### Output
- Files generated in `/dist` directory
- Ready for deployment to any static hosting

### Deployment Options
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [React Icons](https://react-icons.github.io/react-icons)
- [Axios](https://axios-http.com)
- [Vite](https://vitejs.dev)

## Support & Contact

- Lead Developer: Campus IT
- Tech Lead: Emergency Response Team
- Support Email: tech-support@campus.edu

---

**Last Updated**: June 2024
**Version**: 1.0.0

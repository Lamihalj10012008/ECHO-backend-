# ECHO SOS Alert System - API Documentation

## API Overview

The ECHO SOS Alert System uses REST API for all backend communication. The API client is configured in `src/services/api.js` with automatic interceptors for authentication and error handling.

## Base Configuration

**Base URL**: `http://localhost:3000/api`
**Content-Type**: `application/json`
**Authentication**: Bearer Token (JWT)

## Error Handling

All API errors are automatically handled by axios interceptors:
- 401 errors redirect to login
- Network errors show toast notifications
- Response status is checked in components

## API Endpoints

### Emergency Alerts (`/api/sos`)

#### Create Alert
```http
POST /api/sos/alert
```
**Request Body:**
```json
{
  "type": "medical|harassment|accident|fire|theft|other",
  "location": {
    "latitude": 28.5356,
    "longitude": 77.3910,
    "accuracy": 10,
    "address": "Campus Location"
  },
  "description": "Optional emergency description",
  "priority": "critical|high|medium",
  "contacts": [1, 2, 3]
}
```
**Response:**
```json
{
  "id": "1623456789012",
  "type": "medical",
  "status": "created",
  "createdAt": "2024-06-11T10:30:00Z",
  "location": {...},
  "timeline": [{...}]
}
```

#### Get All Alerts
```http
GET /api/sos/alerts?page=1&limit=10&status=all
```
**Query Parameters:**
- `page`: Pagination page (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (all|created|resolved)
- `type`: Filter by emergency type

**Response:**
```json
{
  "data": [
    {
      "id": "1623456789012",
      "type": "medical",
      "status": "resolved",
      "createdAt": "2024-06-11T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### Get Specific Alert
```http
GET /api/sos/alerts/:id
```
**URL Parameters:**
- `id`: Alert ID

**Response:**
```json
{
  "id": "1623456789012",
  "type": "medical",
  "status": "resolved",
  "location": {...},
  "timeline": [...],
  "notifications": [...]
}
```

#### Update Alert Status
```http
PUT /api/sos/alerts/:id/status
```
**Request Body:**
```json
{
  "status": "security_assigned|help_on_way|arrived|resolved",
  "message": "Optional status message"
}
```
**Response:**
```json
{
  "id": "1623456789012",
  "status": "security_assigned",
  "updatedAt": "2024-06-11T10:35:00Z"
}
```

#### Cancel Alert
```http
POST /api/sos/alerts/:id/cancel
```
**Request Body:**
```json
{
  "reason": "False alarm or emergency resolved"
}
```

#### Get Alert Timeline
```http
GET /api/sos/alerts/:id/timeline
```
**Response:**
```json
{
  "timeline": [
    {
      "status": "Alert Created",
      "timestamp": "2024-06-11T10:30:00Z",
      "icon": "🚨",
      "message": "Emergency alert created"
    },
    {
      "status": "Security Assigned",
      "timestamp": "2024-06-11T10:31:00Z",
      "icon": "👮",
      "message": "Officer John Doe assigned"
    }
  ]
}
```

### Notifications (`/api/notifications`)

#### Get All Notifications
```http
GET /api/notifications?page=1&limit=20&read=false
```
**Query Parameters:**
- `page`: Pagination page
- `limit`: Items per page
- `read`: Filter by read status (true|false|all)
- `type`: Filter by notification type

**Response:**
```json
{
  "data": [
    {
      "id": "notif_123",
      "type": "alert_update",
      "title": "Security Assigned",
      "message": "Officer assigned to your emergency",
      "timestamp": "2024-06-11T10:31:00Z",
      "read": false
    }
  ]
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```
**Response:**
```json
{
  "id": "notif_123",
  "read": true,
  "readAt": "2024-06-11T10:35:00Z"
}
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
```
**Request Body:**
```json
{
  "alertId": "1623456789012"
}
```

#### Delete Notification
```http
DELETE /api/notifications/:id
```

### Location (`/api/location`)

#### Update Location
```http
POST /api/sos/alerts/:id/location
```
**Request Body:**
```json
{
  "latitude": 28.5356,
  "longitude": 77.3910,
  "accuracy": 10,
  "timestamp": "2024-06-11T10:35:00Z"
}
```
**Response:**
```json
{
  "alertId": "1623456789012",
  "location": {...},
  "updatedAt": "2024-06-11T10:35:00Z"
}
```

#### Get Location History
```http
GET /api/sos/alerts/:id/location-history?limit=50
```
**Query Parameters:**
- `limit`: Number of location points

**Response:**
```json
{
  "locations": [
    {
      "latitude": 28.5356,
      "longitude": 77.3910,
      "accuracy": 10,
      "timestamp": "2024-06-11T10:35:00Z"
    }
  ]
}
```

### Emergency Contacts (`/api/emergency-contacts`)

#### Get All Contacts
```http
GET /api/emergency-contacts
```
**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Parent",
      "phone": "+91-9876543210",
      "whatsapp": "+91-9876543210",
      "type": "parent|guardian|warden|faculty|security"
    }
  ]
}
```

#### Update Contact
```http
PUT /api/emergency-contacts/:id
```
**Request Body:**
```json
{
  "phone": "+91-9876543210",
  "whatsapp": "+91-9876543210",
  "name": "Updated Name"
}
```

#### Notify Contact
```http
POST /api/emergency-contacts/:id/notify
```
**Request Body:**
```json
{
  "alertId": "1623456789012",
  "method": "call|sms|whatsapp"
}
```

### Analytics (`/api/analytics`)

#### Get Emergency Statistics
```http
GET /api/analytics/stats?period=month
```
**Query Parameters:**
- `period`: month|week|year

**Response:**
```json
{
  "totalEmergencies": 125,
  "resolvedEmergencies": 120,
  "averageResponseTime": 240,
  "emergenciesByType": {
    "medical": 50,
    "accident": 30,
    "harassment": 25
  },
  "emergenciesByStatus": {
    "resolved": 120,
    "pending": 5
  }
}
```

#### Get Emergency History
```http
GET /api/analytics/history?page=1&limit=10&startDate=2024-06-01&endDate=2024-06-30
```
**Query Parameters:**
- `page`: Pagination page
- `limit`: Items per page
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `type`: Filter by emergency type
- `status`: Filter by status

**Response:**
```json
{
  "data": [
    {
      "id": "1623456789012",
      "type": "medical",
      "status": "resolved",
      "createdAt": "2024-06-11T10:30:00Z",
      "resolvedAt": "2024-06-11T10:45:00Z",
      "responseTime": 15,
      "location": {...}
    }
  ]
}
```

## Authentication

### Bearer Token
All authenticated requests must include the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### Token Refresh
When a token expires (401 response):
1. Interceptor automatically removes token
2. User is redirected to login page
3. Fresh token required for next request

## Error Responses

### Standard Error Format
```json
{
  "status": 400,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2024-06-11T10:30:00Z"
}
```

### Common Error Codes
- `INVALID_REQUEST`: Malformed request
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Duplicate resource
- `INTERNAL_SERVER_ERROR`: Server error

## Rate Limiting

- **General API**: 1000 requests/hour
- **SOS Alert**: 10 requests/minute per user
- **Location Updates**: 100 requests/minute per alert

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
```

## Pagination

All list endpoints support pagination:
```http
GET /api/endpoint?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Sorting

Supported sorting format:
```http
GET /api/endpoint?sort=-createdAt,name
```
- `-` prefix for descending order
- Multiple fields separated by comma

## Usage Examples

### JavaScript/Axios
```javascript
import { sosAPI } from './services/api'

// Create alert
const alert = await sosAPI.createAlert({
  type: 'medical',
  location: { latitude, longitude },
  priority: 'critical'
})

// Get alert
const alert = await sosAPI.getAlert(alertId)

// Update status
await sosAPI.updateAlertStatus(alertId, 'help_on_way')
```

### React Component
```jsx
import { useEffect, useState } from 'react'
import { sosAPI } from '../services/api'

export function AlertList() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)
      try {
        const { data } = await sosAPI.getAlerts({ page: 1 })
        setAlerts(data.data)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  return (
    // Component JSX
  )
}
```

## WebSocket Events (Socket.IO Ready)

The API is ready for Socket.IO integration for real-time updates:
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.on('alert:created', (alert) => {
  console.log('New alert:', alert)
})

socket.on('alert:updated', (alert) => {
  console.log('Alert updated:', alert)
})
```

## Best Practices

1. **Always handle errors** with try-catch or .catch()
2. **Validate data** before sending to API
3. **Use loading states** during API calls
4. **Implement retry logic** for failed requests
5. **Cache responses** where appropriate
6. **Use pagination** for large datasets
7. **Debounce** rapid API calls
8. **Log errors** for debugging

## Version

- **API Version**: 1.0.0
- **Last Updated**: June 2024
- **Status**: Production Ready

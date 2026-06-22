# ECHO SOS Alert System - API Documentation

Complete API reference for the ECHO SOS Alert System backend.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require Bearer token authentication.

### Header Format
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User

**Endpoint**: `POST /auth/register`

**Description**: Create a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123",
  "role": "student"
}
```

**Response** (201):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

**Errors**:
- `400` - Email already registered
- `422` - Invalid input data

---

### Login User

**Endpoint**: `POST /auth/login`

**Description**: Authenticate and get access token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Errors**:
- `401` - Invalid email or password
- `403` - User account is inactive

---

### Get Current User

**Endpoint**: `GET /auth/me`

**Description**: Get authenticated user information

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "student",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

---

### Refresh Token

**Endpoint**: `POST /auth/refresh`

**Description**: Get a new access token

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## SOS Alert Endpoints

### Create SOS Alert

**Endpoint**: `POST /sos/alert`

**Description**: Create a new emergency alert

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "emergency_type": "medical",
  "latitude": 28.5355,
  "longitude": 77.3910,
  "location": "Main Campus Building A",
  "description": "Medical emergency in room 101"
}
```

**Response** (201):
```json
{
  "alertId": "SOSE7A2B1C",
  "status": "created",
  "message": "Emergency alert created successfully",
  "id": 1
}
```

**Errors**:
- `400` - Invalid location coordinates
- `401` - User not authenticated

**Emergency Types**: 
- `medical`
- `harassment`
- `accident`
- `fire`
- `theft`
- `other`

---

### Get User's Alerts

**Endpoint**: `GET /sos/alerts`

**Description**: Get all alerts created by the user

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 10, max: 100)

**Response** (200):
```json
[
  {
    "id": 1,
    "alert_id": "SOSE7A2B1C",
    "user_id": 1,
    "emergency_type": "medical",
    "latitude": 28.5355,
    "longitude": 77.3910,
    "location": "Main Campus Building A",
    "description": "Medical emergency in room 101",
    "status": "created",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00",
    "resolved_at": null
  }
]
```

---

### Get Active Alerts

**Endpoint**: `GET /sos/alerts/active`

**Description**: Get all active alerts (Security/Admin only)

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 10, max: 100)

**Response** (200):
```json
[
  {
    "id": 1,
    "alert_id": "SOSE7A2B1C",
    "status": "created",
    "emergency_type": "medical"
  }
]
```

**Errors**:
- `403` - Only security personnel can access

---

### Get Alert Details

**Endpoint**: `GET /sos/alerts/{id}`

**Description**: Get detailed information about a specific alert

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `id`: Alert ID (integer)

**Response** (200):
```json
{
  "id": 1,
  "alert_id": "SOSE7A2B1C",
  "user_id": 1,
  "emergency_type": "medical",
  "latitude": 28.5355,
  "longitude": 77.3910,
  "location": "Main Campus Building A",
  "description": "Medical emergency in room 101",
  "status": "created",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00",
  "resolved_at": null,
  "notifications": [
    {
      "id": 1,
      "alert_id": 1,
      "recipient": "+1234567890",
      "notification_type": "parent",
      "status": "sent",
      "message": "Emergency alert from John Doe",
      "created_at": "2024-01-15T10:30:00",
      "sent_at": "2024-01-15T10:30:10"
    }
  ],
  "tracking": {
    "id": 1,
    "alert_id": 1,
    "assigned_officer": "Officer Singh",
    "current_status": "created",
    "eta_minutes": 5,
    "updated_at": "2024-01-15T10:30:00"
  }
}
```

**Errors**:
- `404` - Alert not found
- `403` - Not authorized to view

---

### Update Alert Status

**Endpoint**: `PUT /sos/alerts/{id}/status`

**Description**: Update emergency alert status (Security/Admin only)

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `id`: Alert ID (integer)

**Request Body**:
```json
{
  "status": "help_on_way",
  "location": "Updated location",
  "description": "Additional details"
}
```

**Response** (200):
```json
{
  "id": 1,
  "alert_id": "SOSE7A2B1C",
  "status": "help_on_way",
  "updated_at": "2024-01-15T10:35:00"
}
```

**Alert Statuses**:
- `created` - Alert just created
- `security_assigned` - Security officer assigned
- `help_on_way` - Help is on the way
- `arrived` - Help has arrived
- `resolved` - Emergency resolved
- `cancelled` - Alert cancelled

---

### Cancel Alert

**Endpoint**: `DELETE /sos/alerts/{id}`

**Description**: Cancel a SOS alert

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `id`: Alert ID (integer)

**Response** (204): No content

**Errors**:
- `404` - Alert not found
- `403` - Not authorized

---

## Emergency Contacts Endpoints

### Get Emergency Contacts

**Endpoint**: `GET /contacts`

**Description**: Get all emergency contacts for the user

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "contact_name": "Mother",
    "phone_number": "+919876543210",
    "relationship": "Parent",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

---

### Create Emergency Contact

**Endpoint**: `POST /contacts`

**Description**: Add a new emergency contact

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "contact_name": "Father",
  "phone_number": "+919876543211",
  "relationship": "Parent"
}
```

**Response** (201):
```json
{
  "id": 2,
  "user_id": 1,
  "contact_name": "Father",
  "phone_number": "+919876543211",
  "relationship": "Parent",
  "created_at": "2024-01-15T10:35:00",
  "updated_at": "2024-01-15T10:35:00"
}
```

**Errors**:
- `422` - Invalid phone number format

---

### Update Emergency Contact

**Endpoint**: `PUT /contacts/{id}`

**Description**: Update an emergency contact

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `id`: Contact ID (integer)

**Request Body**:
```json
{
  "contact_name": "Father Updated",
  "phone_number": "+919876543211",
  "relationship": "Parent"
}
```

**Response** (200):
```json
{
  "id": 2,
  "user_id": 1,
  "contact_name": "Father Updated",
  "phone_number": "+919876543211",
  "relationship": "Parent",
  "updated_at": "2024-01-15T10:40:00"
}
```

**Errors**:
- `404` - Contact not found
- `403` - Not authorized

---

### Delete Emergency Contact

**Endpoint**: `DELETE /contacts/{id}`

**Description**: Remove an emergency contact

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `id`: Contact ID (integer)

**Response** (204): No content

**Errors**:
- `404` - Contact not found
- `403` - Not authorized

---

## Notifications Endpoints

### Get Notifications

**Endpoint**: `GET /notifications`

**Description**: Get all notifications for user's alerts

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 10, max: 100)

**Response** (200):
```json
[
  {
    "id": 1,
    "alert_id": 1,
    "recipient": "+919876543210",
    "notification_type": "parent",
    "status": "sent",
    "message": "Emergency alert from John Doe",
    "created_at": "2024-01-15T10:30:00",
    "sent_at": "2024-01-15T10:30:10"
  }
]
```

---

### Send Notification

**Endpoint**: `POST /notifications/send`

**Description**: Send a notification manually (Security/Admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "alert_id": 1,
  "recipient": "+919876543210",
  "notification_type": "security",
  "message": "Custom notification message"
}
```

**Response** (201):
```json
{
  "id": 2,
  "alert_id": 1,
  "recipient": "+919876543210",
  "notification_type": "security",
  "status": "pending",
  "message": "Custom notification message",
  "created_at": "2024-01-15T10:35:00",
  "sent_at": null
}
```

**Notification Types**:
- `parent`
- `guardian`
- `security`
- `admin`
- `police`
- `hospital`

---

### Mark Notification Sent

**Endpoint**: `PUT /notifications/{id}/mark-sent`

**Description**: Mark notification as sent

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `id`: Notification ID (integer)

**Response** (200):
```json
{
  "id": 1,
  "alert_id": 1,
  "status": "sent",
  "sent_at": "2024-01-15T10:30:10"
}
```

---

## Tracking Endpoints

### Get Tracking Information

**Endpoint**: `GET /tracking/{alertId}`

**Description**: Get emergency response tracking details

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `alertId`: Alert ID (integer)

**Response** (200):
```json
{
  "id": 1,
  "alert_id": 1,
  "assigned_officer": "Officer Singh",
  "current_status": "help_on_way",
  "eta_minutes": 5,
  "updated_at": "2024-01-15T10:35:00"
}
```

**Errors**:
- `404` - Alert or tracking not found
- `403` - Not authorized

---

### Update Tracking Information

**Endpoint**: `PUT /tracking/{alertId}`

**Description**: Update tracking details (Security/Admin only)

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `alertId`: Alert ID (integer)

**Request Body**:
```json
{
  "current_status": "arrived",
  "assigned_officer": "Officer Singh",
  "eta_minutes": 2
}
```

**Response** (200):
```json
{
  "id": 1,
  "alert_id": 1,
  "assigned_officer": "Officer Singh",
  "current_status": "arrived",
  "eta_minutes": 2,
  "updated_at": "2024-01-15T10:37:00"
}
```

---

### Assign Officer

**Endpoint**: `POST /tracking/{alertId}/assign`

**Description**: Assign a security officer to an alert

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `alertId`: Alert ID (integer)

**Query Parameters**:
- `officer_name`: Name of the officer (string)

**Response** (200):
```json
{
  "id": 1,
  "alert_id": 1,
  "assigned_officer": "Officer Singh",
  "current_status": "security_assigned",
  "updated_at": "2024-01-15T10:32:00"
}
```

---

### Set ETA

**Endpoint**: `POST /tracking/{alertId}/eta`

**Description**: Set estimated time of arrival

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `alertId`: Alert ID (integer)

**Query Parameters**:
- `eta_minutes`: ETA in minutes (integer, >= 0)

**Response** (200):
```json
{
  "id": 1,
  "alert_id": 1,
  "current_status": "help_on_way",
  "eta_minutes": 5,
  "updated_at": "2024-01-15T10:33:00"
}
```

---

### Mark Arrival

**Endpoint**: `POST /tracking/{alertId}/arrival`

**Description**: Mark help as arrived at location

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `alertId`: Alert ID (integer)

**Response** (200):
```json
{
  "id": 1,
  "alert_id": 1,
  "current_status": "arrived",
  "updated_at": "2024-01-15T10:36:00"
}
```

---

## WebSocket Endpoints

### Real-time Alert Updates

**Endpoint**: `WS /ws/alerts/{user_id}`

**Description**: Connect to WebSocket for real-time updates

**Example Connection**:
```javascript
const ws = new WebSocket("ws://localhost:8000/ws/alerts/1");

ws.onopen = (event) => {
  console.log("Connected to alert updates");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Alert update:", data);
};

ws.onerror = (event) => {
  console.error("WebSocket error:", event);
};

ws.onclose = (event) => {
  console.log("Disconnected from alert updates");
};
```

**Message Types**:

**Alert Update**:
```json
{
  "type": "alert_update",
  "alert_id": "SOSE7A2B1C",
  "data": {
    "status": "help_on_way",
    "assigned_officer": "Officer Singh",
    "eta_minutes": 5
  }
}
```

**Notification**:
```json
{
  "type": "notification",
  "data": {
    "message": "Emergency alert from John Doe",
    "location": "Main Campus Building A",
    "timestamp": "2024-01-15T10:30:00"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "phone_number"],
      "msg": "Invalid phone format",
      "type": "value_error"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

- General endpoints: 1000 requests/hour
- SOS endpoints: 10 requests/minute
- Location endpoints: 100 requests/minute

---

## Response Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

**Last Updated**: January 2024
**Version**: 1.0.0

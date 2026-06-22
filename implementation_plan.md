# Implementation Plan - Complete SOS Alert System Enhancement

Enhance the ECHO Smart Campus project with a complete SOS Alert System, including contact management,Twilio integration for real-time SMS/WhatsApp notifications, WebSocket broadcasts, escalation workflow, audit logs, rate limiting, and updated frontend views.

## User Review Required

No user actions required. The changes integrate cleanly with the existing database and codebase.

## Proposed Changes

### 1. Database Schema Extensions

#### [MODIFY] [__init__.py](file:///c:/Users/HP/Desktop/ECHO/ECHO-Backend/app/models/__init__.py)
- Add `"active"` to `AlertStatus` enum: `ACTIVE = "active"`.
- Define the `NotificationLog` model:
  - `id` (integer primary key)
  - `sos_id` (foreign key to `sos_alerts.id`)
  - `recipient` (string)
  - `channel` (string: `"SMS"`, `"WhatsApp"`, `"Push"`)
  - `delivery_status` (string: `"pending"`, `"sent"`, `"failed"`, `"delivered"`)
  - `timestamp` (datetime)
- Define the `AuditLog` model:
  - `id` (integer primary key)
  - `user_id` (foreign key to `users.id`, nullable)
  - `action` (string)
  - `details` (text)
  - `timestamp` (datetime)

---

### 2. Backend Routes & Services

#### [NEW] [sos_enhanced.py](file:///c:/Users/HP/Desktop/ECHO/ECHO-Backend/app/api/v1/routes/sos_enhanced.py)
Create a new FastAPI router file defining all the requested `/api` endpoints:
- **Emergency Contacts:**
  - `POST /api/contacts` (Add contact with phone validation and duplicate checks)
  - `GET /api/contacts` (View contacts)
  - `PUT /api/contacts/{id}` (Edit contact)
  - `DELETE /api/contacts/{id}` (Delete contact)
- **SOS Alerts:**
  - `POST /api/sos/trigger` (Create alert, set status to `ACTIVE`, send SMS, WhatsApp, WebSocket notifications, find nearest security office, log audit)
  - `GET /api/sos/history` (View user's SOS history)
  - `GET /api/sos/{id}` (Get specific alert details)
  - `GET /api/sos/live-status/{id}` (Get live status and notification delivery logs)
- **Notification Logs:**
  - `POST /api/notifications/send` (Manually retry/send a custom notification)
  - `GET /api/notifications/history` (View all notification logs)

- **Twilio SMS/WhatsApp Integration:**
  - Implement helper functions using `httpx` to POST messages to Twilio's HTTP endpoints.
  - Read credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_SMS`, `TWILIO_FROM_WHATSAPP`) from `.env`.
  - Fallback to mock log print if environment variables are not set.
- **Escalation Logic:**
  - Identify the nearest campus security office based on GPS coordinate proximity.
  - Simulate Levels 1, 2, and 3 escalation workflows.
- **WebSocket Broadcasts:**
  - Push alert and notification statuses in real-time using uvicorn websocket manager.
- **Rate Limiting & Auditing:**
  - Simple rate-limiter middleware/decorator to restrict request frequency.
  - Insert log entries into `AuditLog` for security audits.

#### [MODIFY] [main.py](file:///c:/Users/HP/Desktop/ECHO/ECHO-Backend/main.py)
- Import `sos_enhanced` router.
- Register routes:
  ```python
  app.include_router(sos_enhanced.contacts_router, prefix="/api/contacts", tags=["Enhanced Contacts"])
  app.include_router(sos_enhanced.sos_router, prefix="/api/sos", tags=["Enhanced SOS"])
  app.include_router(sos_enhanced.notifications_router, prefix="/api/notifications", tags=["Enhanced Notifications"])
  ```

---

### 3. Frontend Integrations

#### [MODIFY] [AlertContext.jsx](file:///c:/Users/HP/Desktop/ECHO/src/context/AlertContext.jsx)
- Expose functions: `fetchContacts`, `addContact`, `editContact`, `deleteContact`.
- Update `createAlert` to call `/api/sos/trigger`.

#### [MODIFY] [EmergencyContacts.jsx](file:///c:/Users/HP/Desktop/ECHO/src/pages/EmergencyContacts.jsx)
- Bind all UI buttons to context operations (`fetchContacts`, `addContact`, `editContact`, `deleteContact`).
- Validate phone numbers prior to calling backend APIs.

#### [MODIFY] [SOSButton.jsx](file:///c:/Users/HP/Desktop/ECHO/src/components/SOSButton.jsx)
- Update button animation to render visual numbers `3`, `2`, `1` in real-time during hold.

#### [NEW] [NotificationStatus.jsx](file:///c:/Users/HP/Desktop/ECHO/src/pages/NotificationStatus.jsx)
- Create a user page to view real-time delivery logs (SMS/WhatsApp/Push status) for active/past alerts.

---

## Verification Plan

### Automated Verification
- Write a test script `test_enhanced_sos.py` to trigger alerts, retrieve history, and verify contacts CRUD operations.

### Manual Verification
- Launch backend and frontend.
- Go to Emergency Contacts page, add parent/guardian contacts.
- Hold SOS Button for 3 seconds, observing the countdown.
- Confirm real-time WebSocket updates and mock Twilio print statements on the backend console.

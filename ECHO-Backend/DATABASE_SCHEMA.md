# ECHO SOS Alert System - Database Schema

Complete database schema documentation for the ECHO SOS Alert System.

## Overview

The database uses PostgreSQL with SQLAlchemy ORM. All models are defined in `app/models/__init__.py`.

---

## Users Table

**Description**: Stores user account information

**SQL Definition**:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  hashed_password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Columns**:
- `id` - Primary Key (Auto-increment)
- `name` - User's full name (max 255 characters)
- `email` - Unique email address
- `phone` - Phone number (optional)
- `hashed_password` - Bcrypt hashed password
- `role` - User role (student, faculty, security, admin)
- `is_active` - Account status
- `created_at` - Account creation timestamp
- `updated_at` - Last updated timestamp

**Constraints**:
- Email must be unique
- Name is required
- Password is required

**Indexes**:
- `email` - For quick user lookup
- `role` - For role-based filtering

---

## Emergency Contacts Table

**Description**: Stores emergency contacts for each user

**SQL Definition**:
```sql
CREATE TABLE emergency_contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  relationship VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
```

**Columns**:
- `id` - Primary Key (Auto-increment)
- `user_id` - Foreign Key to users table
- `contact_name` - Name of contact (max 255 characters)
- `phone_number` - Contact phone number (max 20 characters)
- `relationship` - Relationship to user (e.g., "Parent", "Guardian")
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Constraints**:
- `user_id` is required and references users
- Deletes cascade when user is deleted

**Indexes**:
- `user_id` - For quick contact lookup by user

**Sample Data**:
```
user_id | contact_name | phone_number | relationship
--------|--------------|--------------|---------------
1       | Mother       | +919876543210| Parent
1       | Father       | +919876543211| Parent
1       | Hostel Warden| +910800000100| Hostel Staff
```

---

## SOS Alerts Table

**Description**: Stores emergency alert records

**SQL Definition**:
```sql
CREATE TABLE sos_alerts (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emergency_type VARCHAR(50) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location VARCHAR(500),
  description TEXT,
  status VARCHAR(50) DEFAULT 'created',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_sos_alerts_alert_id ON sos_alerts(alert_id);
CREATE INDEX idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX idx_sos_alerts_created_at ON sos_alerts(created_at);
```

**Columns**:
- `id` - Primary Key (Auto-increment)
- `alert_id` - Unique alert identifier (e.g., "SOSE7A2B1C")
- `user_id` - Foreign Key to users table
- `emergency_type` - Type of emergency (medical, harassment, accident, fire, theft, other)
- `latitude` - GPS latitude coordinate (-90 to 90)
- `longitude` - GPS longitude coordinate (-180 to 180)
- `location` - Human-readable location (max 500 characters)
- `description` - Alert description/notes
- `status` - Current status (created, security_assigned, help_on_way, arrived, resolved, cancelled)
- `created_at` - Alert creation timestamp
- `updated_at` - Last update timestamp
- `resolved_at` - Resolution timestamp (NULL until resolved)

**Constraints**:
- `alert_id` must be unique
- `user_id` is required
- Latitude range: -90 to 90
- Longitude range: -180 to 180

**Indexes**:
- `alert_id` - For quick alert lookup
- `user_id` - For user alert history
- `status` - For filtering by status
- `created_at` - For chronological queries

**Status Workflow**:
```
created → security_assigned → help_on_way → arrived → resolved
                                                    ↓
                                                cancelled
```

---

## Notifications Table

**Description**: Stores alert notifications sent to various recipients

**SQL Definition**:
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER NOT NULL REFERENCES sos_alerts(id) ON DELETE CASCADE,
  recipient VARCHAR(255) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

CREATE INDEX idx_notifications_alert_id ON notifications(alert_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**Columns**:
- `id` - Primary Key (Auto-increment)
- `alert_id` - Foreign Key to sos_alerts table
- `recipient` - Recipient identifier (phone number, email, etc.)
- `notification_type` - Type of recipient (parent, guardian, security, admin, police, hospital)
- `status` - Delivery status (pending, sent, failed, delivered)
- `message` - Notification message content
- `created_at` - Creation timestamp
- `sent_at` - Actual send timestamp

**Constraints**:
- `alert_id` is required
- Deletes cascade when alert is deleted

**Indexes**:
- `alert_id` - For alert notifications
- `status` - For filtering by delivery status
- `created_at` - For chronological queries

**Sample Flow**:
```
1. Alert created → Notifications generated (status: pending)
2. Notifications sent → Status updated to "sent"
3. Confirmation received → Status updated to "delivered"
```

---

## Emergency Tracking Table

**Description**: Stores real-time emergency response tracking information

**SQL Definition**:
```sql
CREATE TABLE emergency_tracking (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER UNIQUE NOT NULL REFERENCES sos_alerts(id) ON DELETE CASCADE,
  assigned_officer VARCHAR(255),
  current_status VARCHAR(50) DEFAULT 'created',
  eta_minutes INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_tracking_alert_id ON emergency_tracking(alert_id);
CREATE INDEX idx_emergency_tracking_status ON emergency_tracking(current_status);
```

**Columns**:
- `id` - Primary Key (Auto-increment)
- `alert_id` - Foreign Key to sos_alerts table (one-to-one relationship)
- `assigned_officer` - Name of assigned security officer
- `current_status` - Current response status
- `eta_minutes` - Estimated time of arrival in minutes
- `updated_at` - Last update timestamp

**Constraints**:
- `alert_id` is unique (one tracking per alert)
- `alert_id` is required

**Indexes**:
- `alert_id` - Quick lookup by alert
- `current_status` - Filter by status

**Status Values**:
- `created` - Alert just created
- `security_assigned` - Officer assigned
- `help_on_way` - Help dispatched
- `arrived` - Help arrived at location
- `resolved` - Emergency resolved

---

## Relationships

```
┌─────────────────────────────────────────┐
│              Users (1)                  │
│                                         │
│ id (PK)                                 │
│ name, email, phone                      │
│ hashed_password, role                   │
│ is_active                               │
└──────────┬──────────────────────────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ▼ (1)                                  ▼ (1)
    ┌──────────────────┐         ┌───────────────────────┐
    │ Emergency Contacts│         │ SOS Alerts            │
    ├──────────────────┤         ├───────────────────────┤
    │ id (PK)          │         │ id (PK)               │
    │ user_id (FK)     │         │ user_id (FK)          │
    │ contact_name     │         │ alert_id (UQ)         │
    │ phone_number     │         │ latitude, longitude   │
    │ relationship     │         │ location, description │
    └──────────────────┘         │ status, resolved_at   │
                                 └───────┬───────────────┘
                                         │
                                    ├────┴──────────────────────┐
                                    │                           │
                                    ▼ (1)                       ▼ (1)
                            ┌────────────────────┐    ┌──────────────────────┐
                            │  Notifications     │    │ Emergency Tracking   │
                            ├────────────────────┤    ├──────────────────────┤
                            │ id (PK)            │    │ id (PK)              │
                            │ alert_id (FK)      │    │ alert_id (FK, UQ)    │
                            │ recipient          │    │ assigned_officer     │
                            │ notification_type  │    │ current_status       │
                            │ status, message    │    │ eta_minutes          │
                            └────────────────────┘    └──────────────────────┘
```

---

## Enums

### UserRole
```python
STUDENT = "student"
FACULTY = "faculty"
SECURITY = "security"
ADMIN = "admin"
```

### EmergencyType
```python
MEDICAL = "medical"
HARASSMENT = "harassment"
ACCIDENT = "accident"
FIRE = "fire"
THEFT = "theft"
OTHER = "other"
```

### AlertStatus
```python
CREATED = "created"
SECURITY_ASSIGNED = "security_assigned"
HELP_ON_WAY = "help_on_way"
ARRIVED = "arrived"
RESOLVED = "resolved"
CANCELLED = "cancelled"
```

### NotificationType
```python
PARENT = "parent"
GUARDIAN = "guardian"
SECURITY = "security"
ADMIN = "admin"
POLICE = "police"
HOSPITAL = "hospital"
```

### NotificationStatus
```python
PENDING = "pending"
SENT = "sent"
FAILED = "failed"
DELIVERED = "delivered"
```

---

## Queries

### Get Active Alerts
```sql
SELECT * FROM sos_alerts 
WHERE status IN ('created', 'security_assigned', 'help_on_way')
ORDER BY created_at DESC;
```

### Get User's Alerts
```sql
SELECT * FROM sos_alerts 
WHERE user_id = 1
ORDER BY created_at DESC;
```

### Get Alert with Tracking
```sql
SELECT 
  a.*,
  t.assigned_officer,
  t.eta_minutes,
  COUNT(n.id) as notification_count
FROM sos_alerts a
LEFT JOIN emergency_tracking t ON a.id = t.alert_id
LEFT JOIN notifications n ON a.id = n.alert_id
WHERE a.id = 1
GROUP BY a.id, t.id;
```

### Get Undelivered Notifications
```sql
SELECT * FROM notifications 
WHERE status != 'delivered'
ORDER BY created_at ASC;
```

### Get Resolved Alerts Count
```sql
SELECT COUNT(*) as resolved_count
FROM sos_alerts
WHERE status = 'resolved';
```

---

## Maintenance

### Backup Database
```bash
# PostgreSQL
pg_dump echo_sos_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
psql echo_sos_db < backup_20240115_103000.sql
```

### Analyze Performance
```sql
ANALYZE;
EXPLAIN SELECT * FROM sos_alerts WHERE user_id = 1;
```

---

**Last Updated**: January 2024
**Version**: 1.0.0

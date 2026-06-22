# ECHO SOS Alert System - Backend API

Production-ready FastAPI backend for the ECHO Smart Campus Emergency Response Platform.

## Features

✅ **Authentication & Authorization**
- JWT token-based authentication
- Role-based access control (Student, Faculty, Security, Admin)
- Secure password hashing with bcrypt
- Token refresh mechanism

✅ **SOS Alert Management**
- Create and manage emergency alerts
- Real-time alert status tracking
- GPS location capture and storage
- Alert history and analytics

✅ **Emergency Contacts**
- Add and manage emergency contacts
- Phone number validation
- Contact relationship tracking

✅ **Notifications**
- Automated notification generation
- Multi-recipient support (parent, guardian, security, admin, police, hospital)
- Notification status tracking
- Delivery confirmation

✅ **Emergency Tracking**
- Assign security officers to alerts
- Real-time location tracking
- ETA updates for help arrival
- Response status timeline

✅ **WebSocket Real-time Communication**
- Live alert updates
- Real-time notifications
- Active connection management
- Broadcasting capabilities

✅ **Production Features**
- Error handling and logging
- Request validation with Pydantic
- CORS and security middleware
- Database connection pooling
- Comprehensive API documentation with Swagger

## Technology Stack

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with python-jose
- **Validation**: Pydantic v2
- **Password Hashing**: Passlib with bcrypt
- **WebSockets**: Native FastAPI WebSocket support
- **API Documentation**: Swagger UI & ReDoc

## Project Structure

```
ECHO-Backend/
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── config.py           # Configuration settings
│   │   └── database.py         # Database setup
│   ├── models/
│   │   └── __init__.py         # SQLAlchemy models
│   ├── schemas/
│   │   └── __init__.py         # Pydantic schemas
│   ├── api/
│   │   └── v1/
│   │       ├── routes/
│   │       │   ├── auth.py     # Authentication endpoints
│   │       │   ├── sos_alerts.py # SOS alert endpoints
│   │       │   ├── contacts.py  # Emergency contact endpoints
│   │       │   ├── notifications.py # Notification endpoints
│   │       │   └── tracking.py  # Tracking endpoints
│   ├── services/
│   │   └── __init__.py         # Business logic
│   ├── auth/
│   │   └── utils.py            # JWT and auth utilities
│   ├── middleware/
│   │   └── error_handler.py    # Error handling middleware
│   ├── websocket/
│   │   └── manager.py          # WebSocket connection management
│   └── utils/
│       └── __init__.py         # Utility functions
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Installation

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip or conda

### Setup

1. **Clone the repository**
```bash
cd ECHO-Backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Update .env with PostgreSQL connection**
```
DATABASE_URL=postgresql://username:password@localhost:5432/echo_sos_db
SECRET_KEY=your-super-secret-key-change-in-production
```

6. **Initialize database**
```bash
python -c "from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

7. **Run the application**
```bash
python main.py
# or
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### SOS Alerts
- `POST /api/v1/sos/alert` - Create SOS alert
- `GET /api/v1/sos/alerts` - Get user's alerts
- `GET /api/v1/sos/alerts/active` - Get active alerts (security/admin)
- `GET /api/v1/sos/alerts/{id}` - Get alert details
- `PUT /api/v1/sos/alerts/{id}/status` - Update alert status
- `DELETE /api/v1/sos/alerts/{id}` - Cancel alert

### Emergency Contacts
- `GET /api/v1/contacts` - Get emergency contacts
- `POST /api/v1/contacts` - Create contact
- `PUT /api/v1/contacts/{id}` - Update contact
- `DELETE /api/v1/contacts/{id}` - Delete contact

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `POST /api/v1/notifications/send` - Send notification
- `PUT /api/v1/notifications/{id}/mark-sent` - Mark as sent

### Tracking
- `GET /api/v1/tracking/{alertId}` - Get tracking info
- `PUT /api/v1/tracking/{alertId}` - Update tracking
- `POST /api/v1/tracking/{alertId}/assign` - Assign officer
- `POST /api/v1/tracking/{alertId}/eta` - Set ETA
- `POST /api/v1/tracking/{alertId}/arrival` - Mark arrival

### WebSocket
- `WS /ws/alerts/{user_id}` - Real-time alert updates

## Database Models

### Users
- `id` (Primary Key)
- `name` (String)
- `email` (String, Unique)
- `phone` (String, Optional)
- `hashed_password` (String)
- `role` (Enum: student, faculty, security, admin)
- `is_active` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### SOS Alerts
- `id` (Primary Key)
- `alert_id` (String, Unique)
- `user_id` (Foreign Key)
- `emergency_type` (Enum)
- `latitude` (Float)
- `longitude` (Float)
- `location` (String)
- `description` (Text)
- `status` (Enum)
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `resolved_at` (DateTime, Optional)

### Emergency Contacts
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `contact_name` (String)
- `phone_number` (String)
- `relationship` (String)

### Notifications
- `id` (Primary Key)
- `alert_id` (Foreign Key)
- `recipient` (String)
- `notification_type` (Enum)
- `status` (Enum: pending, sent, failed, delivered)
- `message` (Text)
- `created_at` (DateTime)
- `sent_at` (DateTime, Optional)

### Emergency Tracking
- `id` (Primary Key)
- `alert_id` (Foreign Key)
- `assigned_officer` (String)
- `current_status` (Enum)
- `eta_minutes` (Integer)
- `updated_at` (DateTime)

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/echo_sos_db
DATABASE_ECHO=True

SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

DEBUG=True
HOST=0.0.0.0
PORT=8000

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-password

APP_NAME=ECHO SOS Alert System
APP_VERSION=1.0.0
```

## Authentication

### User Registration
```json
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123",
  "role": "student"
}
```

### User Login
```json
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Using Authentication
Include the token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## SOS Alert Workflow

1. **User triggers SOS**
```json
POST /api/v1/sos/alert
{
  "emergency_type": "medical",
  "latitude": 28.5355,
  "longitude": 77.3910,
  "location": "Main Campus Building A",
  "description": "Medical emergency in room 101"
}

Response:
{
  "alertId": "SOSE7A2B1C",
  "status": "created",
  "message": "Emergency alert created successfully",
  "id": 1
}
```

2. **Notifications are sent** to:
   - Emergency contacts
   - Campus security
   - Admin team

3. **Security officer assigns themselves**
```json
POST /api/v1/tracking/1/assign?officer_name=Officer%20Singh
```

4. **Security updates status**
```json
PUT /api/v1/sos/alerts/1/status
{
  "status": "help_on_way"
}
```

5. **Real-time updates** via WebSocket
```javascript
ws = new WebSocket("ws://localhost:8000/ws/alerts/1");
ws.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};
```

## WebSocket Events

### Alert Update
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

### Notification
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

## Error Handling

All errors follow a standard format:
```json
{
  "detail": "Error description"
}
```

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security

✅ **Implemented**
- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- HTTPS ready
- CORS configuration
- Trusted host middleware
- SQL injection prevention via ORM
- Input validation with Pydantic

✅ **Recommended for Production**
- Enable HTTPS/TLS
- Set secure CORS origins
- Use environment variables for secrets
- Enable rate limiting
- Add request logging
- Regular security audits
- Database backups
- Monitoring and alerting

## API Documentation

### Swagger UI
Access API documentation at: `http://localhost:8000/docs`

### ReDoc
Access alternative documentation at: `http://localhost:8000/redoc`

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
```

### Linting
```bash
pylint app/
```

## Database Migrations

### With Alembic (Recommended for production)
```bash
# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Without Alembic
The application automatically creates tables using SQLAlchemy when started.

## Performance Optimization

- **Database Connection Pooling**: Automatic with SQLAlchemy
- **Query Optimization**: Index on frequently queried columns
- **Caching**: Can be added with Redis
- **Async Operations**: Ready for async services

## Deployment

### Local Development
```bash
python main.py
```

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 app.main:app
```

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment Options
- **Heroku**: Deploy directly from Git
- **AWS**: Using ECS, App Runner, or Lambda
- **Azure**: App Service or Container Instances
- **Google Cloud**: Cloud Run or App Engine
- **DigitalOcean**: App Platform or Droplets

## Monitoring & Logging

- **Application Logging**: Configured at app startup
- **Access Logs**: Uvicorn provides access logs
- **Error Tracking**: Can integrate with Sentry
- **Performance Monitoring**: Can integrate with New Relic

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## Support

For issues, feature requests, or questions:
- Create a GitHub issue
- Contact: support@echo.campus
- Documentation: `/docs` endpoint

## License

Proprietary - ECHO Smart Campus Platform

## Version

v1.0.0 - Production Ready

---

**Last Updated**: January 2024

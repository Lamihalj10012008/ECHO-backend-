# ECHO SOS Alert System - Quick Start Guide

## 5-Minute Setup

### 1. Clone & Navigate
```bash
cd ECHO-Backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Database

**Option A: PostgreSQL (Recommended)**
```bash
# Create database
createdb echo_sos_db

# Create user (optional)
# psql -c "CREATE USER echo_user WITH PASSWORD 'password';"
# psql -c "ALTER ROLE echo_user CREATEDB;"
```

**Option B: SQLite (For Development)**
```bash
# Change in .env:
DATABASE_URL=sqlite:///./echo_sos.db
```

### 5. Setup Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

Example .env:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/echo_sos_db
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
PORT=8000
```

### 6. Initialize Database
```bash
python -c "from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

### 7. Run Server
```bash
python main.py
```

Server running at: `http://localhost:8000`

---

## API Documentation

**Swagger UI**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc
**Health Check**: http://localhost:8000/health

---

## Test API with cURL

### Register User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Create SOS Alert
```bash
curl -X POST "http://localhost:8000/api/v1/sos/alert" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_type": "medical",
    "latitude": 28.5355,
    "longitude": 77.3910,
    "location": "Main Building",
    "description": "Medical emergency"
  }'
```

---

## Test API with Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "student"
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "john@example.com",
    "password": "SecurePass123"
})
token = response.json()["access_token"]

# Create alert
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/sos/alert", 
    headers=headers,
    json={
        "emergency_type": "medical",
        "latitude": 28.5355,
        "longitude": 77.3910,
        "location": "Main Building",
        "description": "Medical emergency"
    }
)
print(response.json())
```

---

## Test WebSocket

```javascript
// JavaScript
const ws = new WebSocket("ws://localhost:8000/ws/alerts/1");

ws.onopen = () => console.log("Connected");
ws.onmessage = (event) => console.log("Message:", event.data);
ws.onerror = (event) => console.error("Error:", event);
ws.onclose = () => console.log("Disconnected");
```

---

## Common Issues & Solutions

### Issue: `Database connection refused`
**Solution**: 
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Or use SQLite instead
# Change DATABASE_URL in .env
```

### Issue: `Port 8000 already in use`
**Solution**:
```bash
# Run on different port
uvicorn app.main:app --port 8001
```

### Issue: `ModuleNotFoundError: No module named 'app'`
**Solution**:
```bash
# Make sure you're in ECHO-Backend directory
cd ECHO-Backend
python main.py
```

### Issue: `SECRET_KEY not configured`
**Solution**:
```bash
# Copy .env.example to .env
cp .env.example .env
# Edit .env and fill in required values
```

---

## Project Structure

```
ECHO-Backend/
├── app/
│   ├── core/              # Config & Database
│   ├── models/            # SQLAlchemy Models
│   ├── schemas/           # Pydantic Schemas
│   ├── api/v1/routes/     # API Endpoints
│   ├── services/          # Business Logic
│   ├── auth/              # Authentication
│   ├── middleware/        # Error Handling
│   ├── websocket/         # WebSocket Manager
│   └── utils/             # Utility Functions
├── main.py                # Application Entry
├── requirements.txt       # Dependencies
├── .env.example          # Config Template
├── README.md             # Full Documentation
├── API.md                # API Reference
└── QUICK_START.md        # This File
```

---

## Key Features Enabled

✅ User Registration & Login
✅ SOS Alert Management
✅ Emergency Contacts
✅ Notifications System
✅ Real-time Tracking
✅ WebSocket Updates
✅ Role-based Access Control
✅ JWT Authentication
✅ Comprehensive API Docs
✅ Error Handling

---

## Next Steps

1. **Frontend Integration**
   - Update API URL in React frontend
   - Test SOS flow end-to-end

2. **Production Setup**
   - Change SECRET_KEY
   - Enable HTTPS
   - Configure CORS properly
   - Set up database backups

3. **Testing**
   - Write unit tests
   - Test all endpoints
   - Load testing

4. **Deployment**
   - Deploy to cloud (AWS/Azure/GCP)
   - Configure CI/CD pipeline
   - Set up monitoring

---

## Support

- API Docs: http://localhost:8000/docs
- Issues: Create GitHub issue
- Email: support@echo.campus

---

**Version**: 1.0.0
**Status**: Production Ready

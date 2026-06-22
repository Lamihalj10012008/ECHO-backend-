# ECHO SOS Alert System - Configuration Guide

Complete configuration reference for the ECHO SOS Alert System backend.

## Environment Variables

### Essential Configuration

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/echo_sos_db
DATABASE_ECHO=True  # Set to False in production

# JWT & Security
SECRET_KEY=your-super-secret-key-change-in-production-to-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
DEBUG=True  # Set to False in production
HOST=0.0.0.0
PORT=8000

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-password

# Application Info
APP_NAME=ECHO SOS Alert System
APP_VERSION=1.0.0
```

### Production Configuration

```bash
# Database (Production)
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@prod_host:5432/echo_sos_db
DATABASE_ECHO=False

# Security (Production)
SECRET_KEY=generate-with-secrets.token_urlsafe(32)
DEBUG=False
ALLOWED_HOSTS=api.echo.campus,api-backup.echo.campus

# CORS Configuration
CORS_ORIGINS=https://echo.campus,https://www.echo.campus,https://app.echo.campus
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=*

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_PERIOD=3600  # seconds

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
LOG_LEVEL=INFO
```

---

## Generate Secret Key

### Python
```python
import secrets
secret_key = secrets.token_urlsafe(32)
print(secret_key)
```

### Bash
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### OpenSSL
```bash
openssl rand -base64 32
```

---

## Database Connection Strings

### PostgreSQL

```bash
# Default
postgresql://user:password@localhost/dbname

# With port
postgresql://user:password@localhost:5432/dbname

# AWS RDS
postgresql://user:password@echo-db.xxxxx.us-east-1.rds.amazonaws.com:5432/dbname

# Heroku
postgresql://user:password@ec2-xxx.compute-1.amazonaws.com:5432/dbname
```

### SQLite (Development Only)

```bash
sqlite:///./echo_sos.db
```

---

## CORS Configuration

### Allow Specific Origins

```python
# In app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://echo.campus",
        "https://www.echo.campus"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Allow All Origins (Development Only)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Logging Configuration

### Console Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### File Logging

```python
import logging

handler = logging.FileHandler('app.log')
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger = logging.getLogger(__name__)
logger.addHandler(handler)
```

### JSON Logging (Production)

```python
from pythonjsonlogger import jsonlogger
import logging

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
```

---

## Database Configuration

### Connection Pooling

```python
# In app/core/database.py
from sqlalchemy import create_engine, pool

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,  # Test connections before using
    pool_recycle=3600,   # Recycle connections after 1 hour
)
```

### Query Timeout

```python
from sqlalchemy import event
from sqlalchemy.pool import Pool

@event.listens_for(Pool, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()
```

---

## JWT Configuration

### Token Expiry

```python
# Short-lived tokens (1 hour)
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Refresh token strategy
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Token Validation

```python
# In app/auth/utils.py
def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
```

---

## Rate Limiting

### Per-User Limits

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/sos/alert")
@limiter.limit("10/minute")
async def create_alert(request: Request, ...):
    pass
```

### Endpoint-Specific Limits

```python
# SOS endpoint: 10 requests/minute
# Tracking endpoint: 100 requests/minute
# General endpoints: 1000 requests/hour
```

---

## Email Configuration

### Gmail Setup

```bash
# Enable "Less secure app access" or use App Password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

### SendGrid

```bash
SENDGRID_API_KEY=your-api-key
SENDER_EMAIL=noreply@echo.campus
```

### Custom SMTP

```bash
SMTP_SERVER=mail.example.com
SMTP_PORT=587
SMTP_USERNAME=username
SMTP_PASSWORD=password
SENDER_EMAIL=noreply@example.com
```

---

## Security Best Practices

### HTTPS/TLS

```nginx
# Force HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Password Hashing

```python
# Bcrypt configuration
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # More rounds = more secure but slower
)
```

### CSRF Protection

```python
from fastapi_csrf_protect import CsrfProtect

@app.post("/api/v1/sos/alert")
async def create_alert(csrf_protect: CsrfProtect = Depends()):
    pass
```

---

## Deployment Settings

### Local Development

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/echo_sos_db
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Staging

```bash
DATABASE_URL=postgresql://staging_user:password@staging-db.example.com:5432/echo_sos_db
DEBUG=False
ALLOWED_HOSTS=staging-api.echo.campus
CORS_ORIGINS=https://staging.echo.campus
```

### Production

```bash
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@prod-db.example.com:5432/echo_sos_db
DEBUG=False
ALLOWED_HOSTS=api.echo.campus,api-backup.echo.campus
CORS_ORIGINS=https://echo.campus,https://www.echo.campus
SENTRY_DSN=https://key@sentry.io/project-id
LOG_LEVEL=WARNING
```

---

## Feature Flags

### Enable/Disable Features

```python
# In app/core/config.py
ENABLE_WEBSOCKET=True
ENABLE_EMAIL_NOTIFICATIONS=False
ENABLE_SMS_NOTIFICATIONS=True
ENABLE_RATE_LIMITING=True
ENABLE_REQUEST_LOGGING=True
```

---

## Monitoring Configuration

### Application Performance

```python
# NewRelic
NEW_RELIC_CONFIG_FILE=newrelic.ini
NEW_RELIC_ENVIRONMENT=production

# Datadog
DATADOG_API_KEY=your-api-key
DATADOG_APP_KEY=your-app-key
```

### Error Tracking

```python
# Sentry
SENTRY_DSN=https://key@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ENVIRONMENT=production
```

---

## Testing Configuration

### Pytest

```python
# conftest.py
@pytest.fixture
def test_db():
    # Create test database
    # Run migrations
    # Yield session
    # Cleanup
    pass

@pytest.fixture
def client():
    return TestClient(app)
```

### Test Database URL

```bash
# SQLite for fast testing
TEST_DATABASE_URL=sqlite:///./test.db

# Separate PostgreSQL
TEST_DATABASE_URL=postgresql://test_user:password@localhost:5432/echo_sos_test
```

---

## Version-Specific Settings

### Python Version

```bash
# Tested on
python >= 3.9
```

### Package Versions

```bash
# See requirements.txt for exact versions
FastAPI==0.104.1
SQLAlchemy==2.0.23
PostgreSQL==15+
```

---

## Optimization Settings

### Query Optimization

```python
# Add indexes for common queries
# Use eager loading for relationships
# Enable query result caching
```

### Connection Pooling

```python
# Production settings
pool_size=20
max_overflow=40
pool_recycle=3600
```

### Caching

```python
# Redis configuration (optional)
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=300  # 5 minutes
```

---

## Support

For configuration questions:
- Check `.env.example` for all available variables
- Review documentation for each setting
- Test in development before production deployment

---

**Last Updated**: January 2024
**Version**: 1.0.0

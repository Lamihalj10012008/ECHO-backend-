# ECHO SOS Alert System - Deployment Guide

Production deployment instructions for the ECHO SOS Alert System backend.

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backup setup
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for frontend domain
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup
- [ ] Error tracking setup (Sentry)
- [ ] Database migrations applied
- [ ] Secret key changed
- [ ] Debug mode disabled

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: echo_db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-echo_sos_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    container_name: echo_backend
    environment:
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-password}@db:5432/${DB_NAME:-echo_sos_db}
      SECRET_KEY: ${SECRET_KEY}
      DEBUG: ${DEBUG:-False}
      PORT: 8000
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - ./app:/app/app

volumes:
  postgres_data:

networks:
  default:
    name: echo_network
```

### Build and Run

```bash
# Build image
docker build -t echo-backend:1.0 .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## Kubernetes Deployment

### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echo-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: echo-backend
  template:
    metadata:
      labels:
        app: echo-backend
    spec:
      containers:
      - name: backend
        image: echo-backend:1.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: echo-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: echo-secrets
              key: secret-key
        - name: DEBUG
          value: "False"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: echo-backend-service
spec:
  type: LoadBalancer
  selector:
    app: echo-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic echo-secrets \
  --from-literal=database-url=postgresql://user:pass@db:5432/echo_sos_db \
  --from-literal=secret-key=your-secret-key

# Apply deployment
kubectl apply -f deployment.yaml

# Check status
kubectl get deployments
kubectl get pods
kubectl logs -f deployment/echo-backend

# Scale deployment
kubectl scale deployment echo-backend --replicas=5
```

---

## Cloud Platforms

### AWS (ECS)

```bash
# Create ECR repository
aws ecr create-repository --repository-name echo-backend

# Push image
docker tag echo-backend:1.0 123456789.dkr.ecr.us-east-1.amazonaws.com/echo-backend:1.0
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/echo-backend:1.0

# Create ECS task definition and service
# (Use AWS Console or CLI)
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create echo-sos-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Google Cloud Run

```bash
# Authenticate
gcloud auth login

# Build image
gcloud builds submit --tag gcr.io/PROJECT-ID/echo-backend

# Deploy
gcloud run deploy echo-backend \
  --image gcr.io/PROJECT-ID/echo-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://...,SECRET_KEY=...
```

---

## Nginx Reverse Proxy

```nginx
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.echo.campus;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.echo.campus;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.echo.campus/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.echo.campus/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Static files caching
    location /docs {
        proxy_pass http://backend;
        expires 1h;
    }
}
```

---

## SSL/HTTPS Setup

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d api.echo.campus

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring Setup

### Application Monitoring

```python
# Add to app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0
)
```

### Logging Configuration

```python
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)
```

---

## Performance Tuning

### Database

```sql
-- Create indexes for common queries
CREATE INDEX idx_sos_alerts_status_created ON sos_alerts(status, created_at);
CREATE INDEX idx_notifications_alert_status ON notifications(alert_id, status);

-- Analyze query plans
ANALYZE;
```

### Gunicorn Configuration

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:8000 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  app.main:app
```

---

## Database Maintenance

### Backup Strategy

```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/backups/echo_sos"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump echo_sos_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Automated Backups with AWS S3

```bash
#!/bin/bash
# Backup to S3
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump echo_sos_db | gzip | \
  aws s3 cp - s3://echo-backups/backup_$DATE.sql.gz

# Lifecycle policy for S3 to delete after 90 days (via AWS Console)
```

---

## Security Configuration

### Environment Production

```bash
# .env.production
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@prod_host:5432/echo_sos_db
SECRET_KEY=VERY_LONG_RANDOM_SECRET_KEY_HERE
DEBUG=False
ALLOWED_HOSTS=api.echo.campus,www.api.echo.campus
CORS_ORIGINS=https://echo.campus,https://www.echo.campus
```

### Security Headers

```python
# In app/main.py
from fastapi.middleware import cors, trustedhost

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Add security headers middleware
from starlette.middleware import base

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

---

## Health Monitoring

### Health Check Script

```python
import requests
import sys

def check_health():
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✓ Service is healthy")
            return 0
        else:
            print(f"✗ Service returned {response.status_code}")
            return 1
    except Exception as e:
        print(f"✗ Health check failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(check_health())
```

---

## Scaling

### Horizontal Scaling

```bash
# With Docker Swarm
docker service create --name echo-backend --replicas 5 echo-backend:1.0

# With Kubernetes
kubectl scale deployment echo-backend --replicas=10
```

### Load Balancing

- **HAProxy**: For TCP/HTTP load balancing
- **Nginx**: For reverse proxy + load balancing
- **AWS ALB**: For cloud deployment
- **Google Cloud Load Balancer**: For GCP deployment

---

## Rollback Procedure

```bash
# Docker
docker service update --image echo-backend:0.9 echo-backend

# Kubernetes
kubectl rollout undo deployment/echo-backend

# Verify
kubectl rollout history deployment/echo-backend
```

---

## Support & Troubleshooting

**Logs**:
```bash
# Docker
docker-compose logs -f backend

# Kubernetes
kubectl logs -f deployment/echo-backend

# Systemd (if deployed with systemd)
journalctl -u echo-backend -f
```

**Performance Issues**:
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

---

**Last Updated**: January 2024
**Version**: 1.0.0

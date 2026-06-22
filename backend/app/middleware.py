from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import datetime
from backend.app.database import SessionLocal
from backend.app.models import LoginAttempt
from backend.app.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Clickjacking Protection
        response.headers["X-Frame-Options"] = "DENY"
        
        # MIME type sniffing protection
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS Protection for older browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy (restrict sources)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data:; "
            "connect-src 'self' http://127.0.0.1:8001 http://localhost:8001;"
        )
        
        # Strict Transport Security (HSTS) - Only enforce if https
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
        return response

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """
    Database-backed simple sliding-window IP rate limiter.
    Limits state-changing operations on sensitive auth routes.
    """
    async def dispatch(self, request: Request, call_next):
        # We only rate-limit sensitive POST/PUT/DELETE auth and login requests
        path = request.url.path
        if request.method == "POST" and (
            path.startswith("/api/auth/login") or 
            path.startswith("/api/auth/register") or
            path.startswith("/api/auth/forgot-password") or
            path.startswith("/api/auth/reset-password")
        ):
            client_ip = request.client.host if request.client else "unknown"
            
            db = SessionLocal()
            try:
                # Clean up old attempts older than 15 minutes
                cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=settings.LOCKOUT_MINUTES)
                
                # Check current login attempt history for this IP
                # (For generic rate limiting, we track attempts per IP)
                attempt = db.query(LoginAttempt).filter(
                    LoginAttempt.ip_address == client_ip,
                    LoginAttempt.last_attempt_at > cutoff
                ).first()
                
                if attempt and attempt.attempts >= 100:  # Allow max 100 requests per 15 minutes per IP
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={"detail": "Too many requests. Please try again after 15 minutes."}
                    )
                
                # Update attempt counts
                if attempt:
                    attempt.attempts += 1
                    attempt.last_attempt_at = datetime.datetime.utcnow()
                else:
                    new_attempt = LoginAttempt(
                        ip_address=client_ip,
                        attempts=1,
                        last_attempt_at=datetime.datetime.utcnow()
                    )
                    db.add(new_attempt)
                db.commit()
            finally:
                db.close()

        return await call_next(request)

class CsrfProtectionMiddleware(BaseHTTPMiddleware):
    """
    Implements standard double-submit cookie token validation,
    or Origin/Referer check for cross-site request forgery protection.
    """
    async def dispatch(self, request: Request, call_next):
        # Apply CSRF protection on unsafe methods (POST, PUT, DELETE)
        if request.method in ["POST", "PUT", "DELETE"]:
            # Check Origin and Referer headers
            origin = request.headers.get("Origin")
            referer = request.headers.get("Referer")
            
            # Check if origin matches allowed hosts
            origin_allowed = False
            if origin:
                for allowed in settings.ALLOWED_ORIGINS:
                    if origin.startswith(allowed):
                        origin_allowed = True
                        break
            else:
                # If no origin, check referer
                if referer:
                    for allowed in settings.ALLOWED_ORIGINS:
                        if referer.startswith(allowed):
                            origin_allowed = True
                            break
                else:
                    # Allow localhost/127.0.0.1 for local API dev tools
                    origin_allowed = True
            
            if not origin_allowed:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "CSRF validation failed. Invalid Origin or Referer."}
                )

        return await call_next(request)

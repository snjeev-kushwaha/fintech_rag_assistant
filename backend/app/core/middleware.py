"""
FinSolve Technologies — Security Middlewares & Brute-Force Rate Limiting
Injects enterprise HTTP security headers and limits rapid failed authentication attempts.
"""

import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

# In-memory sliding window rate limiter for login
_login_attempts: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_LOGIN_ATTEMPTS = 15  # Max 15 login attempts per minute per IP


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects enterprise HTTP security headers to protect against
    Clickjacking, MIME-Sniffing, XSS, and unauthorized framing.
    """

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        return response


class LoginRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Protects /auth/login against brute-force password guessing attacks.
    """

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/auth/login" and request.method == "POST":
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()

            # Clean old timestamps
            attempts = [t for t in _login_attempts[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
            _login_attempts[client_ip] = attempts

            if len(attempts) >= MAX_LOGIN_ATTEMPTS:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too many login attempts. Please wait 60 seconds before trying again."
                    },
                    headers={"Retry-After": "60"},
                )

            # Record attempt
            _login_attempts[client_ip].append(now)

        return await call_next(request)

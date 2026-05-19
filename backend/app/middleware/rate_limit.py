import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 20, window: int = 60):
        """
        limit: Max requests allowed inside the window
        window: Sliding window time range in seconds
        """
        super().__init__(app)
        self.limit = limit
        self.window = window
        # Mapping IP -> list of request timestamps
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method
        
        # Rate limit only critical POST/PUT/DELETE interactions
        is_sensitive = False
        if method in ["POST", "PUT", "DELETE"]:
            sensitive_keywords = ["/api/auth/login", "/api/contact", "/api/content/upload", "/api/gallery", "/api/projects"]
            is_sensitive = any(keyword in path for keyword in sensitive_keywords)

        if is_sensitive:
            client_ip = request.client.host
            now = time.time()
            
            # Clean old timestamps outside the sliding window
            self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
            
            # Check rate violation
            if len(self.requests[client_ip]) >= self.limit:
                logger.warning("Rate limit exceeded for IP %s on path %s", client_ip, path)
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please wait a minute and try again."}
                )
            
            # Append new request timestamp
            self.requests[client_ip].append(now)

        response = await call_next(request)
        return response

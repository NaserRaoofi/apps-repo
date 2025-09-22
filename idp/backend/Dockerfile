# Multi-stage build for ultra-lightweight FastAPI backend
FROM python:3.11-alpine as builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev \
    openssl-dev \
    cargo \
    rust \
    git

# Set work directory
WORKDIR /build

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies in user directory
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage - ultra-lightweight
FROM python:3.11-alpine

# Install only runtime dependencies
RUN apk add --no-cache \
    postgresql-libs \
    git \
    curl \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set work directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code with proper ownership
COPY --chown=appuser:appgroup . .

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Create necessary directories for values and ensure permissions
RUN mkdir -p /app/website-template/values && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)" || exit 1

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Use exec form to ensure proper signal handling
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

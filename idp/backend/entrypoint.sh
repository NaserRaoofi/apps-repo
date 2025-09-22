#!/bin/sh

# Website IDP Backend Entrypoint Script
# Handles initialization and graceful startup

set -e

echo "🚀 Starting Website IDP Backend..."

# Environment validation
echo "📋 Environment validation..."
echo "  - Python path: ${PYTHONPATH}"
echo "  - Working directory: $(pwd)"
echo "  - User: $(whoami)"
echo "  - Target branch: ${IDP_VALUES_BRANCH:-main}"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /app/website-template/values
echo "  ✅ Values directory ready"

# Check database connectivity (if using external DB)
echo "🔍 Checking database connectivity..."
python -c "
try:
    from app.database import init_db
    init_db()
    print('  ✅ Database connection successful')
except Exception as e:
    print(f'  ⚠️  Database warning: {e}')
"

# Check git configuration
echo "🔧 Checking git configuration..."
if git config --global user.name >/dev/null 2>&1; then
    echo "  ✅ Git user configured: $(git config --global user.name)"
else
    echo "  ⚠️  Git user not configured, using defaults"
    git config --global user.name "Website IDP Backend" || true
    git config --global user.email "idp@naserraoofi.com" || true
fi

# Health check before starting
echo "🏥 Pre-flight health check..."
python -c "
import sys
import importlib.util

# Check critical imports
modules = ['fastapi', 'uvicorn', 'sqlalchemy', 'yaml', 'subprocess']
for module in modules:
    try:
        importlib.import_module(module)
        print(f'  ✅ {module} available')
    except ImportError as e:
        print(f'  ❌ {module} missing: {e}')
        sys.exit(1)
"

echo "🎯 All checks passed! Starting application..."

# Start the application with proper signal handling
exec "$@"

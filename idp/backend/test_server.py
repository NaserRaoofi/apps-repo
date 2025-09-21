#!/usr/bin/env python3
"""
Minimal test script to check if the FastAPI server can start.
"""
import os
import sys

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

try:
    from app.main import app

    print("✓ FastAPI app imported successfully")

    # Test database connection
    from app.database import init_db

    init_db()
    print("✓ Database initialized successfully")

    # Test API routes
    from app.api.routes import health, jobs, websites

    print("✓ API routes imported successfully")

    print("\n🎉 Backend server is ready to start!")
    print("Run: uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload")

except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

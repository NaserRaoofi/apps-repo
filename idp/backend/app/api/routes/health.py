from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Website IDP API is running"}


@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    # TODO: Add checks for database, redis, etc.
    return {"status": "ready", "checks": {"database": "ok", "redis": "ok"}}

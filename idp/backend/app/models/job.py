from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class JobType(str, Enum):
    WEBSITE_CREATE = "website_create"
    WEBSITE_UPDATE = "website_update"
    WEBSITE_DELETE = "website_delete"
    TERRAFORM_APPLY = "terraform_apply"
    TERRAFORM_DESTROY = "terraform_destroy"


class JobResponse(BaseModel):
    """Response model for job information."""

    id: str
    job_type: JobType
    status: JobStatus
    website_id: Optional[str] = None
    progress: int = 0
    logs: list = []
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """Response model for job list."""

    jobs: list[JobResponse]
    total: int
    page: int
    size: int

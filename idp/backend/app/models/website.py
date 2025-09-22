from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator


class ResourcePlan(str, Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"


class WebsiteType(str, Enum):
    WORDPRESS = "wordpress"
    DRUPAL = "drupal"
    CUSTOM = "custom"


class DatabaseType(str, Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"


class WebsiteCreateRequest(BaseModel):
    """Simplified request model for creating a new website."""

    # Simple form fields from frontend
    adminUsername: str = Field(..., description="WordPress admin username")
    adminPassword: str = Field(..., description="WordPress admin password")
    adminEmail: str = Field(..., description="WordPress admin email")
    blogName: str = Field(..., description="WordPress blog name")
    subdomain: str = Field(..., description="Subdomain for the website")

    # Auto-generated fields (set by backend)
    websiteId: Optional[str] = Field(None, description="Auto-generated from subdomain")
    domain: Optional[str] = Field(None, description="Auto-generated full domain")
    type: Optional[WebsiteType] = Field(
        WebsiteType.WORDPRESS, description="Always WordPress"
    )
    cluster: Optional[str] = Field("dev", description="Default cluster")
    plan: Optional[ResourcePlan] = Field(ResourcePlan.BASIC, description="Default plan")
    databaseType: Optional[DatabaseType] = Field(
        DatabaseType.INTERNAL, description="Default database"
    )
    storageClass: Optional[str] = Field("gp2", description="Default storage class")

    @validator("websiteId")
    def validate_website_id(cls, v):
        import re

        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError(
                "Website ID must contain only lowercase letters, "
                "numbers, and hyphens"
            )
        if v.startswith("-") or v.endswith("-") or "--" in v:
            raise ValueError(
                "Website ID cannot start/end with hyphens or "
                "contain consecutive hyphens"
            )
        return v

    @validator("domain")
    def validate_domain(cls, v):
        import re

        pattern = (
            r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
            r"(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
        )
        if not re.match(pattern, v):
            raise ValueError("Invalid domain format")
        return v


class WebsiteResponse(BaseModel):
    """Response model for website information."""

    id: str
    website_id: str
    domain: str
    resource_plan: ResourcePlan
    website_type: WebsiteType
    status: str
    created_at: datetime
    updated_at: datetime
    deployed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WebsiteListResponse(BaseModel):
    """Response model for website list."""

    websites: List[WebsiteResponse]
    total: int
    page: int
    size: int


class ResourcePlanInfo(BaseModel):
    """Resource plan information."""

    name: str
    cpu_request: str
    cpu_limit: str
    memory_request: str
    memory_limit: str
    storage: str
    description: str


class ResourcePlansResponse(BaseModel):
    """Response model for available resource plans."""

    plans: Dict[str, ResourcePlanInfo]

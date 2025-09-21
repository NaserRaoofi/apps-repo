import enum

from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class WebsiteTypeEnum(enum.Enum):
    WORDPRESS = "wordpress"
    DRUPAL = "drupal"
    CUSTOM = "custom"


class ResourcePlanEnum(enum.Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"


class DatabaseTypeEnum(enum.Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"


class WebsiteStatusEnum(enum.Enum):
    PENDING = "pending"
    CREATING = "creating"
    RUNNING = "running"
    FAILED = "failed"
    STOPPED = "stopped"
    DELETING = "deleting"


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(String(50), unique=True, index=True, nullable=False)

    # Website Details
    domain = Column(String(255), nullable=False)
    website_type = Column(SQLEnum(WebsiteTypeEnum), nullable=False)
    cluster = Column(String(50), nullable=False, default="dev")

    # Resource Configuration
    resource_plan = Column(SQLEnum(ResourcePlanEnum), nullable=False)
    database_type = Column(SQLEnum(DatabaseTypeEnum), nullable=False)
    storage_class = Column(String(50), nullable=False, default="gp2")

    # Admin Configuration
    admin_username = Column(String(100), nullable=False)
    admin_password = Column(String(255), nullable=False)  # Will be hashed
    admin_email = Column(String(255), nullable=False)

    # Status and Metadata
    status = Column(SQLEnum(WebsiteStatusEnum), default=WebsiteStatusEnum.PENDING)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deployed_at = Column(DateTime(timezone=True), nullable=True)

    # Additional fields
    description = Column(Text, nullable=True)
    namespace = Column(String(100), nullable=True)  # Kubernetes namespace
    ingress_url = Column(String(255), nullable=True)  # Full URL

    def __repr__(self):
        return (
            f"<Website(id={self.id}, website_id='{self.website_id}', "
            f"status='{self.status}')>"
        )

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "website_id": self.website_id,
            "domain": self.domain,
            "website_type": (self.website_type.value if self.website_type else None),
            "cluster": self.cluster,
            "resource_plan": (self.resource_plan.value if self.resource_plan else None),
            "database_type": (self.database_type.value if self.database_type else None),
            "storage_class": self.storage_class,
            "admin_username": self.admin_username,
            "admin_email": self.admin_email,
            "status": self.status.value if self.status else None,
            "created_at": (self.created_at.isoformat() if self.created_at else None),
            "updated_at": (self.updated_at.isoformat() if self.updated_at else None),
            "deployed_at": (self.deployed_at.isoformat() if self.deployed_at else None),
            "description": self.description,
            "namespace": self.namespace,
            "ingress_url": self.ingress_url,
        }

    def to_helm_values(self):
        """Generate Helm values.yaml structure from website data."""
        resource_configs = {
            "basic": {"cpu": "200m", "memory": "512Mi", "storage": "5Gi"},
            "standard": {"cpu": "500m", "memory": "1Gi", "storage": "10Gi"},
            "premium": {"cpu": "1000m", "memory": "2Gi", "storage": "20Gi"},
        }

        plan_config = resource_configs.get(
            self.resource_plan.value, resource_configs["basic"]
        )

        return {
            "site": {
                "name": self.website_id,
                "domain": self.domain,
            },
            "wordpress": {
                "username": self.admin_username,
                "password": "changeme",  # Will be auto-generated in deployment
                "email": self.admin_email,
                "title": f"{self.website_id.replace('-', ' ').title()} Site",
            },
            "resources": {
                "requests": {
                    "cpu": plan_config["cpu"],
                    "memory": plan_config["memory"],
                },
                "limits": {"cpu": plan_config["cpu"], "memory": plan_config["memory"]},
            },
            "storage": {
                "class": self.storage_class,
                "size": plan_config["storage"],
            },
            "database": {
                "enabled": self.database_type == DatabaseTypeEnum.INTERNAL,
                "user": "wpuser",
                "password": "wppass",  # Will be auto-generated
                "rootPassword": "rootpass",  # Will be auto-generated
                "name": f"{self.website_id.replace('-', '_')}_db",
            },
            "image": {
                "repository": f"{self.website_type.value}",
                "tag": "latest",
                "pullPolicy": "IfNotPresent",
            },
            "replicaCount": 1,
            "service": {"type": "ClusterIP", "port": 80},
            "ingress": {
                "enabled": True,
                "className": "nginx",
                "annotations": {"cert-manager.io/cluster-issuer": "letsencrypt-prod"},
            },
            "autoscaling": {
                "enabled": False,
                "minReplicas": 1,
                "maxReplicas": 5,
                "targetCPUUtilizationPercentage": 70,
            },
            "nodeSelector": {},
            "tolerations": [],
            "affinity": {},
            "podSecurityContext": {},
            "securityContext": {},
        }

from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Website IDP"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Internal Developer Platform for Website Deployment"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database
    DATABASE_URL: str = "sqlite:///./website_idp.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Git Repository
    GIT_REPO_URL: str = "https://github.com/NaserRaoofi/apps-repo.git"
    GIT_REPO_PATH: str = "/tmp/apps-repo"

    # Kubernetes
    KUBECONFIG_PATH: Optional[str] = None

    # AWS/Terraform
    AWS_REGION: str = "us-west-2"
    TERRAFORM_MODULES_PATH: str = "./terraform/modules"

    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://idp.naserraoofi.com",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

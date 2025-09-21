import logging
import subprocess
from pathlib import Path
from typing import Any, Dict

import yaml
from app.config import settings

logger = logging.getLogger(__name__)


def create_website_task(job_id: str, website_config: Dict[str, Any]):
    """Background task to create a website."""
    logger.info(f"Starting website creation task for job {job_id}")

    try:
        # Update job status to running
        # TODO: Update job in database

        # Step 1: Generate website files
        logger.info("Generating website configuration files...")
        _generate_website_files(website_config)

        # Step 2: Apply Kubernetes secrets
        logger.info("Applying Kubernetes secrets...")
        _apply_kubernetes_secrets(website_config)

        # Step 3: Wait for ArgoCD sync (or trigger manual sync)
        logger.info("Triggering ArgoCD sync...")
        _trigger_argocd_sync(website_config["website_id"])

        # Step 4: Verify deployment
        logger.info("Verifying deployment...")
        _verify_deployment(website_config["website_id"])

        logger.info(f"Website {website_config['website_id']} created successfully")
        # TODO: Update job status to completed

    except Exception as e:
        logger.error(f"Failed to create website: {str(e)}")
        # TODO: Update job status to failed
        raise


def _generate_website_files(config: Dict[str, Any]):
    """Generate website configuration files."""
    website_id = config["website_id"]
    app_dir = Path(settings.GIT_REPO_PATH) / "apps" / website_id
    app_dir.mkdir(parents=True, exist_ok=True)

    # Generate values.yaml
    values = _create_values_yaml(config)
    with open(app_dir / "values.yaml", "w") as f:
        yaml.dump(values, f, default_flow_style=False, sort_keys=False)

    # Generate secrets.yaml
    secrets = _create_secrets_yaml(config)
    with open(app_dir / "secrets.yaml", "w") as f:
        yaml.dump(secrets, f, default_flow_style=False, sort_keys=False)

    # Generate README.md
    readme = _create_readme(config)
    with open(app_dir / "README.md", "w") as f:
        f.write(readme)

    # Commit and push changes
    _commit_and_push_changes(website_id)


def _create_values_yaml(config: Dict[str, Any]) -> Dict[str, Any]:
    """Create values.yaml content."""
    # Resource plans mapping
    resource_plans = {
        "basic": {
            "cpu_request": "100m",
            "cpu_limit": "200m",
            "memory_request": "256Mi",
            "memory_limit": "512Mi",
            "storage": "1Gi",
        },
        "standard": {
            "cpu_request": "250m",
            "cpu_limit": "500m",
            "memory_request": "512Mi",
            "memory_limit": "1Gi",
            "storage": "5Gi",
        },
        "premium": {
            "cpu_request": "500m",
            "cpu_limit": "1",
            "memory_request": "1Gi",
            "memory_limit": "2Gi",
            "storage": "20Gi",
        },
    }

    plan = resource_plans[config["resource_plan"]]

    values = {
        "name": config["website_id"],
        "domain": config["domain"],
        "replicaCount": 1,
        "image": {
            "repository": config["image_repository"],
            "tag": config["image_tag"],
            "pullPolicy": "IfNotPresent",
        },
        "service": {"type": "ClusterIP", "port": 80, "targetPort": 8080},
        "ingress": {
            "enabled": True,
            "className": "alb",
            "annotations": {
                "kubernetes.io/ingress.class": "alb",
                "alb.ingress.kubernetes.io/scheme": "internet-facing",
                "alb.ingress.kubernetes.io/target-type": "ip",
                "alb.ingress.kubernetes.io/listen-ports": '[{"HTTP": 80}, {"HTTPS": 443}]',
                "alb.ingress.kubernetes.io/ssl-redirect": "443",
                "alb.ingress.kubernetes.io/healthcheck-path": "/",
            },
        },
        "resources": {
            "limits": {"cpu": plan["cpu_limit"], "memory": plan["memory_limit"]},
            "requests": {"cpu": plan["cpu_request"], "memory": plan["memory_request"]},
        },
        "persistence": {
            "enabled": True,
            "storageClass": config["storage_class"],
            "size": plan["storage"],
        },
    }

    # Add certificate ARN if provided
    if config.get("certificate_arn"):
        values["ingress"]["annotations"][
            "alb.ingress.kubernetes.io/certificate-arn"
        ] = config["certificate_arn"]

    # Add environment variables based on website type
    if config["website_type"] == "wordpress":
        values["env"] = [
            {
                "name": "WORDPRESS_DB_HOST",
                "value": config.get("database_host", f"mysql-{config['website_id']}"),
            },
            {
                "name": "WORDPRESS_DB_NAME",
                "value": config.get(
                    "database_name", f"{config['website_id'].replace('-', '_')}_db"
                ),
            },
            {"name": "WORDPRESS_DB_USER", "value": "wordpress"},
            {
                "name": "WORDPRESS_DB_PASSWORD",
                "valueFrom": {
                    "secretKeyRef": {
                        "name": f"{config['website_id']}-secrets",
                        "key": "db-password",
                    }
                },
            },
            {"name": "WORDPRESS_USERNAME", "value": config["admin_username"]},
            {
                "name": "WORDPRESS_PASSWORD",
                "valueFrom": {
                    "secretKeyRef": {
                        "name": f"{config['website_id']}-secrets",
                        "key": "admin-password",
                    }
                },
            },
            {"name": "WORDPRESS_EMAIL", "value": config["admin_email"]},
        ]
    elif config["website_type"] == "drupal":
        values["env"] = [
            {
                "name": "DRUPAL_DATABASE_HOST",
                "value": config.get("database_host", f"mysql-{config['website_id']}"),
            },
            {
                "name": "DRUPAL_DATABASE_NAME",
                "value": config.get(
                    "database_name", f"{config['website_id'].replace('-', '_')}_db"
                ),
            },
            {"name": "DRUPAL_DATABASE_USER", "value": "drupal"},
            {
                "name": "DRUPAL_DATABASE_PASSWORD",
                "valueFrom": {
                    "secretKeyRef": {
                        "name": f"{config['website_id']}-secrets",
                        "key": "db-password",
                    }
                },
            },
            {"name": "DRUPAL_USERNAME", "value": config["admin_username"]},
            {
                "name": "DRUPAL_PASSWORD",
                "valueFrom": {
                    "secretKeyRef": {
                        "name": f"{config['website_id']}-secrets",
                        "key": "admin-password",
                    }
                },
            },
            {"name": "DRUPAL_EMAIL", "value": config["admin_email"]},
        ]

    return values


def _create_secrets_yaml(config: Dict[str, Any]) -> Dict[str, Any]:
    """Create secrets.yaml content."""
    import base64
    import secrets
    import string

    # Generate passwords if not provided
    if "admin_password" not in config:
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        config["admin_password"] = "".join(secrets.choice(alphabet) for _ in range(16))

    if "db_password" not in config:
        alphabet = string.ascii_letters + string.digits
        config["db_password"] = "".join(secrets.choice(alphabet) for _ in range(24))

    # Encode passwords
    admin_password_b64 = base64.b64encode(config["admin_password"].encode()).decode()
    db_password_b64 = base64.b64encode(config["db_password"].encode()).decode()

    secrets_yaml = {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {
            "name": f"{config['website_id']}-secrets",
            "namespace": config["website_id"],
        },
        "type": "Opaque",
        "data": {"admin-password": admin_password_b64, "db-password": db_password_b64},
    }

    return secrets_yaml


def _create_readme(config: Dict[str, Any]) -> str:
    """Create README.md content."""
    return f"""# {config['website_id'].title()} Website

## Configuration

- **Website ID**: {config['website_id']}
- **Domain**: {config['domain']}
- **Type**: {config['website_type'].title()}
- **Resource Plan**: {config['resource_plan'].title()}

## Admin Access

- **Username**: {config['admin_username']}
- **Email**: {config['admin_email']}

## Deployment

This website is automatically deployed by ArgoCD ApplicationSet.

## Access

- **URL**: https://{config['domain']}
"""


def _apply_kubernetes_secrets(config: Dict[str, Any]):
    """Apply Kubernetes secrets."""
    website_id = config["website_id"]
    secrets_file = Path(settings.GIT_REPO_PATH) / "apps" / website_id / "secrets.yaml"

    # Apply secrets using kubectl
    subprocess.run(["kubectl", "apply", "-f", str(secrets_file)], check=True)


def _commit_and_push_changes(website_id: str):
    """Commit and push changes to Git repository."""
    repo_path = Path(settings.GIT_REPO_PATH)

    # Add files
    subprocess.run(["git", "add", f"apps/{website_id}/"], cwd=repo_path, check=True)

    # Commit
    subprocess.run(
        ["git", "commit", "-m", f"Add website configuration for {website_id}"],
        cwd=repo_path,
        check=True,
    )

    # Push
    subprocess.run(["git", "push", "origin", "main"], cwd=repo_path, check=True)


def _trigger_argocd_sync(website_id: str):
    """Trigger ArgoCD application sync."""
    # TODO: Implement ArgoCD CLI or API call
    pass


def _verify_deployment(website_id: str):
    """Verify that the deployment was successful."""
    # TODO: Check if pods are running, ingress is ready, etc.
    pass


def delete_website_task(job_id: str, website_id: str):
    """Background task to delete a website."""
    logger.info(f"Starting website deletion task for job {job_id}")

    try:
        # Update job status to running
        # TODO: Update job in database

        # Step 1: Delete Kubernetes resources
        logger.info("Deleting Kubernetes resources...")
        _delete_kubernetes_resources(website_id)

        # Step 2: Remove website files from Git
        logger.info("Removing website files...")
        _remove_website_files(website_id)

        logger.info(f"Website {website_id} deleted successfully")
        # TODO: Update job status to completed

    except Exception as e:
        logger.error(f"Failed to delete website: {str(e)}")
        # TODO: Update job status to failed
        raise


def _delete_kubernetes_resources(website_id: str):
    """Delete Kubernetes resources for a website."""
    # Delete namespace (this will delete all resources in it)
    subprocess.run(
        ["kubectl", "delete", "namespace", website_id, "--ignore-not-found=true"],
        check=True,
    )


def _remove_website_files(website_id: str):
    """Remove website files from Git repository."""
    import shutil

    repo_path = Path(settings.GIT_REPO_PATH)
    website_dir = repo_path / "apps" / website_id

    if website_dir.exists():
        shutil.rmtree(website_dir)

        # Commit and push changes
        subprocess.run(["git", "add", "-A"], cwd=repo_path, check=True)
        subprocess.run(
            ["git", "commit", "-m", f"Remove website configuration for {website_id}"],
            cwd=repo_path,
            check=True,
        )
        subprocess.run(["git", "push", "origin", "main"], cwd=repo_path, check=True)

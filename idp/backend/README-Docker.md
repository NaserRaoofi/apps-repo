# Website IDP Backend - Containerized

Ultra-lightweight FastAPI backend for WordPress website deployment automation.

## 🐳 Docker Features

- **Ultra-lightweight**: Multi-stage Alpine Linux build (~150MB final image)
- **Security**: Non-root user, minimal attack surface
- **Performance**: Optimized Python dependencies, minimal layers
- **Production-ready**: Health checks, proper signal handling, resource limits
- **Auto-push**: Background watcher pushes values to GitHub main branch every 2 seconds

## 📦 Quick Start

### 1. Build the Image

```bash
# Build with default tag
./build.sh

# Build with custom tag
./build.sh v1.0.0

# Build and push to registry
./build.sh latest push
```

### 2. Run with Docker Compose (Recommended)

```bash
# Start the backend
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop the backend
docker-compose down
```

### 3. Run with Docker CLI

```bash
# Basic run
docker run -p 8000:8000 website-idp-backend:latest

# Run with environment variables
docker run -p 8000:8000 \
  -e IDP_VALUES_BRANCH=main \
  -e DATABASE_URL=sqlite:///./website_idp.db \
  -v $(pwd)/website-template/values:/app/website-template/values \
  website-idp-backend:latest

# Run in background
docker run -d --name idp-backend -p 8000:8000 website-idp-backend:latest
```

## 🔧 Configuration

### Environment Variables

```bash
# GitHub Service
IDP_VALUES_BRANCH=main              # Target branch for auto-push (default: main)

# Database
DATABASE_URL=sqlite:///./website_idp.db  # Database connection string

# FastAPI
PYTHONPATH=/app                     # Python module path
PYTHONUNBUFFERED=1                  # Immediate stdout/stderr
PYTHONDONTWRITEBYTECODE=1           # Skip .pyc files

# Optional API settings
API_V1_STR=/api/v1                  # API prefix
PROJECT_NAME="Website IDP Backend"  # Project name
```

### Volume Mounts

```bash
# Values persistence
-v $(pwd)/website-template/values:/app/website-template/values

# Database persistence (SQLite)
-v $(pwd)/website_idp.db:/app/website_idp.db

# Git configuration (if needed)
-v ~/.gitconfig:/home/appuser/.gitconfig:ro
-v ~/.ssh:/home/appuser/.ssh:ro
```

## 🚀 Features

### Auto-Push Watcher

- **Monitors**: `/app/website-template/values/` directory
- **Interval**: Every 2 seconds
- **Pattern**: `values-*.yaml` files
- **Target**: GitHub main branch (configurable)
- **Method**: Safe worktree push (no developer branch merge)

### API Endpoints

- **Health**: `GET /health` - Service health check
- **Docs**: `GET /docs` - Interactive API documentation
- **Websites**: `POST /api/v1/websites` - Create new WordPress site
- **List**: `GET /api/v1/websites` - List all websites

### Security Features

- Non-root user execution (UID 1001)
- Minimal Alpine Linux base
- No unnecessary packages
- Security-focused multi-stage build

## 🔍 Monitoring

### Health Checks

```bash
# Container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Manual health check
curl http://localhost:8000/health

# Health check inside container
docker exec idp-backend python -c "import requests; print(requests.get('http://localhost:8000/health').json())"
```

### Logs

```bash
# View logs
docker logs -f idp-backend

# Structured logs with docker-compose
docker-compose logs -f backend

# Follow logs with timestamp
docker logs -f --timestamps idp-backend
```

## 📊 Performance

### Resource Usage

- **Memory**: ~256MB base, 512MB limit
- **CPU**: 0.25-0.5 cores
- **Disk**: ~150MB image size
- **Startup**: ~5-10 seconds

### Optimization Features

- Multi-stage build reduces image size by ~60%
- Alpine Linux base for minimal footprint
- No-cache pip installs to reduce layers
- Optimized Python bytecode compilation
- Efficient layer caching

## 🔨 Development

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Build Process

1. **Builder stage**: Install dependencies with build tools
2. **Production stage**: Copy only runtime dependencies
3. **Security**: Create non-root user
4. **Optimization**: Remove unnecessary files and caches

### File Structure

```
idp/backend/
├── Dockerfile              # Multi-stage Alpine build
├── docker-compose.yml      # Development/production setup
├── .dockerignore           # Build context optimization
├── build.sh                # Build automation script
├── entrypoint.sh           # Container initialization
├── requirements.txt        # Python dependencies
├── app/                    # FastAPI application
│   ├── main.py            # Application entry point
│   ├── services/          # GitHub auto-push service
│   └── ...                # Other app modules
└── website-template/       # Helm values directory
    └── values/            # Generated values files
```

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   # Fix file permissions
   sudo chown -R 1001:1001 website-template/values/
   chmod -R 755 website-template/values/
   ```

2. **Git Configuration**

   ```bash
   # Set git config in container
   docker exec idp-backend git config --global user.name "Your Name"
   docker exec idp-backend git config --global user.email "your@email.com"
   ```

3. **Health Check Failing**

   ```bash
   # Check service status
   docker exec idp-backend curl -f http://localhost:8000/health || echo "Service down"

   # Check logs for errors
   docker logs idp-backend --tail 50
   ```

4. **Values Not Pushing**

   ```bash
   # Check watcher status
   docker logs idp-backend | grep GitHubService

   # Verify branch setting
   docker exec idp-backend env | grep IDP_VALUES_BRANCH
   ```

## 📈 Production Deployment

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: website-idp-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: website-idp-backend
  template:
    metadata:
      labels:
        app: website-idp-backend
    spec:
      containers:
        - name: backend
          image: website-idp-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: IDP_VALUES_BRANCH
              value: "main"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Docker Swarm

```bash
# Deploy stack
docker stack deploy -c docker-compose.yml idp-stack

# Scale services
docker service scale idp-stack_backend=3
```

## 🎯 Next Steps

1. **Registry**: Push to container registry (Docker Hub, ECR, GCR)
2. **CI/CD**: Add automated builds and deployments
3. **Monitoring**: Add Prometheus metrics endpoint
4. **Scaling**: Configure horizontal pod autoscaling
5. **Security**: Add image scanning and vulnerability checks

---

**Ready to deploy!** 🚀

The containerized backend is production-ready with automatic GitHub integration, health monitoring, and ultra-lightweight Alpine Linux base.

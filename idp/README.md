# WordPress Deployment Platform

A lightweight, containerized platform for deploying WordPress sites with simplified configuration and automated infrastructure provisioning.

## 🚀 Features

- **🎯 Simplified WordPress Deployment**: 5-field form for easy WordPress site creation
- **📦 Ultra-Lightweight Containers**: Multi-stage Alpine builds (Backend: 203MB, Frontend: 54.7MB)
- **🔄 Auto-Push Integration**: Automatic GitHub commit and push for generated values
- **🏗️ Bitnami Helm Integration**: Production-ready WordPress deployment with Bitnami charts
- **☁️ AWS ALB + ACM**: Integrated load balancer and SSL certificate management
- **🔐 Security Hardened**: Non-root containers with proper user permissions (UID 1001)
- **📊 Health Monitoring**: Built-in health checks and service monitoring
- **� Docker Hub Ready**: Production images available on Docker Hub

## 📁 Project Structure

```
idp/
├── backend/                 # FastAPI Backend (203MB Alpine image)
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   ├── core/           # Core functionality and database
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic services
│   │   └── github_service.py # Auto-push GitHub integration
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Multi-stage Alpine container
│   └── entrypoint.sh      # Container initialization
├── frontend/               # Next.js Frontend (54.7MB Alpine image)
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # WordPress deployment form
│   │   └── lib/          # API utilities
│   ├── nginx.conf        # Production nginx configuration
│   ├── Dockerfile        # Multi-stage build (Node.js + Nginx)
│   └── package.json      # Node.js dependencies
├── docker-compose.test.yml # Full stack testing
└── values/               # Generated Helm values (auto-pushed)
```

## 🛠️ Technology Stack

### Backend (203MB Alpine Container)

- **FastAPI**: Modern, fast web framework for Python APIs
- **SQLAlchemy**: Database ORM with PostgreSQL support
- **GitPython**: Automated Git commit and push functionality
- **Uvicorn**: ASGI server for production deployments
- **Alpine Linux**: Ultra-lightweight base image for security
- **Non-root Security**: Dedicated appuser (UID 1001) for enhanced security
- **Python-Terraform**: Terraform automation

### Frontend (54.7MB Alpine Container)

- **Next.js 14**: React framework with static export
- **TypeScript**: Type-safe JavaScript development
- **TailwindCSS**: Utility-first CSS framework
- **Nginx**: Production web server with API proxy
- **Alpine Linux**: Minimal production container
- **Multi-stage Build**: Optimized build process (Node.js build + Nginx serve)

### Infrastructure

- **Docker & Docker Compose**: Containerized deployment
- **Bitnami Helm Charts**: Production-ready WordPress deployment
- **AWS ALB**: Application Load Balancer with SSL termination
- **AWS ACM**: Automatic SSL certificate management
- **External DNS**: Automated Route53 DNS management
- **GitHub Integration**: Automatic commit and push workflow

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git configuration for auto-push functionality
- Kubernetes cluster (for production deployment)

### Using Docker Hub Images (Recommended)

The easiest way to run the platform is using our pre-built images from Docker Hub:

1. **Pull and run with Docker Compose**

   ```bash
   # Create docker-compose.yml
   cat > docker-compose.yml << 'EOF'
   version: '3.8'
   services:
     backend:
       image: naserraoofi/backend:v1.0.0
       ports:
         - "8000:8000"
       environment:
         - DATABASE_URL=sqlite:///./websites.db
         - GITHUB_TOKEN=${GITHUB_TOKEN}
         - GITHUB_REPO=${GITHUB_REPO}
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
         interval: 30s
         timeout: 10s
         retries: 3

     frontend:
       image: naserraoofi/frontend:v1.0.0
       ports:
         - "3000:80"
       depends_on:
         backend:
           condition: service_healthy
       environment:
         - NEXT_PUBLIC_API_URL=http://localhost:8000
   EOF

   # Set required environment variables
   export GITHUB_TOKEN=your_github_token
   export GITHUB_REPO=your_username/your_repo

   # Start the platform
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - API Health: http://localhost:8000/api/v1/health

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/NaserRaoofi/apps-repo.git
   cd apps-repo/idp
   ```

2. **Start with Docker Compose (Development)**

   ```bash
   # Use the test compose file for development
   docker-compose -f docker-compose.test.yml up --build
   ```

3. **Manual Development Setup**

   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Frontend (in another terminal)
   cd frontend
   npm install
   npm run dev
   ```

## 📋 WordPress Deployment Workflow

This platform simplifies WordPress deployment to just 5 essential fields:

### 1. **Simple Form Input**

- **Website Name**: Unique identifier for your WordPress site
- **Domain**: Your custom domain (e.g., mysite.example.com)
- **Resource Plan**: Basic (200m CPU/512Mi RAM) | Standard (500m CPU/1Gi RAM) | Premium (1 CPU/2Gi RAM)
- **Database**: Internal (automatic) | External (provide connection details)
- **Admin Credentials**: WordPress admin username and password

### 2. **Automated Processing**

- Generate Bitnami WordPress Helm values.yaml
- Configure AWS ALB ingress with SSL certificate
- Automatic GitHub commit and push to main branch
- Ready for Kubernetes deployment with ArgoCD or manual kubectl

### 3. **Infrastructure Features**

- **AWS ALB Integration**: Automatic load balancer configuration
- **SSL/TLS**: ACM certificate integration for secure connections
- **External DNS**: Automatic Route53 DNS record creation
- **Persistent Storage**: EBS volume provisioning for WordPress data
- **Auto-scaling**: HPA configuration based on resource plan

### 4. **Generated Output**

Each form submission creates a complete `values-{website-name}.yaml` file with:

- Bitnami WordPress configuration
- Resource limits and requests
- Ingress configuration with SSL
- Database connection settings
- Security configurations

## 🔧 API Endpoints

### WordPress Deployment

- `POST /api/v1/websites` - Create new WordPress site

  ```json
  {
    "website_name": "mysite",
    "domain": "mysite.example.com",
    "resource_plan": "standard",
    "database_type": "internal",
    "admin_username": "admin",
    "admin_password": "secure_password"
  }
  ```

- `GET /api/v1/websites` - List all WordPress deployments
- `GET /api/v1/websites/{name}` - Get specific website details
- `DELETE /api/v1/websites/{name}` - Remove website configuration

### System Health

- `GET /api/v1/health` - Application health check
- `GET /api/v1/health/ready` - Container readiness probe
- `GET /api/v1/health/live` - Container liveness probe

### GitHub Integration

- Auto-push enabled by default for all generated values files
- Commits to main branch with descriptive messages
- 2-second polling for new files in values directory

## 🔐 Security Features

- **Container Security**: Non-root containers running as UID 1001
- **Multi-stage Builds**: Minimal attack surface with Alpine Linux
- **Input Validation**: Comprehensive request validation with Pydantic
- **Environment Isolation**: Secure credential handling via environment variables
- **Health Monitoring**: Built-in health checks for container orchestration
- **Resource Limits**: Proper CPU and memory constraints

## � Container Images

Both images are available on Docker Hub and optimized for production use:

- **Backend**: `naserraoofi/backend:v1.0.0` (203MB Alpine + FastAPI)
- **Frontend**: `naserraoofi/frontend:v1.0.0` (54.7MB Alpine + Nginx)

### Image Features

- **Multi-stage builds** for minimal size
- **Security hardened** with non-root users
- **Health checks** integrated
- **Environment variable** configuration
- **Production ready** with proper logging

## 🚀 Roadmap

- [x] **Simplified WordPress Form**: 5-field deployment interface
- [x] **Bitnami Integration**: Production-ready WordPress Helm charts
- [x] **AWS ALB + ACM**: Automated load balancer and SSL setup
- [x] **Auto-Push GitHub**: Automatic commit and push workflow
- [x] **Container Optimization**: Ultra-lightweight Alpine images
- [x] **Docker Hub Deployment**: Public registry availability
- [ ] **ArgoCD Integration**: GitOps deployment automation
- [ ] **Multi-cluster Support**: Deploy across multiple Kubernetes clusters
- [ ] **Backup Automation**: Automated WordPress backup solutions
- [ ] **Cost Optimization**: Resource usage tracking and recommendations
- [ ] **Template Customization**: User-defined WordPress configurations
- [ ] **Monitoring Dashboard**: WordPress site health and performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions and support:

- Create an issue in this repository
- Contact: naser.raoofi@example.com
- Docker Hub: [naserraoofi/backend](https://hub.docker.com/r/naserraoofi/backend) | [naserraoofi/frontend](https://hub.docker.com/r/naserraoofi/frontend)

## 🏷️ Version Information

- **Current Version**: v1.0.0
- **Backend Image**: naserraoofi/backend:v1.0.0 (203MB)
- **Frontend Image**: naserraoofi/frontend:v1.0.0 (54.7MB)
- **Last Updated**: September 2025

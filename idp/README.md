# Website IDP - Internal Developer Platform

A modern, production-ready Internal Developer Platform for deploying and managing websites with automated infrastructure provisioning.

## 🚀 Features

- **⚛️ Modern React UI**: Production-ready React.js frontend with TypeScript and TailwindCSS
- **🎯 Modular Architecture**: Template-based infrastructure deployment with intelligent template selection
- **🔄 Background Processing**: Redis Queue (RQ) system for async job processing with real-time logging
- **🏗️ Clean Architecture**: Production-ready FastAPI backend with proper separation of concerns
- **🛠️ Terraform Integration**: Modular infrastructure as code with reusable AWS modules
- **☸️ Kubernetes Native**: Automated deployment with ArgoCD GitOps workflow
- **📊 Real-time Monitoring**: WebSocket-based job status updates and logging
- **🔐 Security First**: Kubernetes secrets management and secure credential handling

## 📁 Project Structure

```
idp/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   ├── core/           # Core functionality (auth, database)
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic services
│   │   └── tasks/          # Background task definitions
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and API clients
│   │   └── types/        # TypeScript type definitions
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Frontend container
└── terraform/             # Infrastructure as Code
    ├── modules/           # Reusable Terraform modules
    └── environments/      # Environment-specific configs
```

## 🛠️ Technology Stack

### Backend

- **FastAPI**: Modern, fast web framework for Python APIs
- **Redis Queue (RQ)**: Background job processing
- **SQLAlchemy**: Database ORM with PostgreSQL
- **Kubernetes Client**: Direct Kubernetes API integration
- **GitPython**: Git repository management
- **Python-Terraform**: Terraform automation

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management
- **React Hook Form**: Form management with validation
- **Socket.IO**: Real-time WebSocket communication
- **Headless UI**: Accessible UI components

### Infrastructure

- **Kubernetes**: Container orchestration
- **ArgoCD**: GitOps continuous deployment
- **Terraform**: Infrastructure as Code
- **AWS ALB**: Load balancing and ingress
- **Redis**: Caching and job queue
- **PostgreSQL**: Primary database

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Kubernetes cluster with ArgoCD
- AWS CLI configured
- Node.js 18+ and Python 3.11+

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/NaserRaoofi/apps-repo.git
   cd apps-repo/idp
   ```

2. **Start backend services**

   ```bash
   cd backend

   # Install dependencies
   pip install -r requirements.txt

   # Start Redis
   docker run -d -p 6379:6379 redis:alpine

   # Start API server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

   # Start worker (in another terminal)
   python -m app.worker
   ```

3. **Start frontend**

   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - API Health: http://localhost:8000/api/v1/health

### Production Deployment

1. **Deploy with Docker Compose**

   ```bash
   docker-compose up -d
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

## 📋 Website Creation Workflow

1. **User Input Collection**

   - Website ID (unique identifier)
   - Domain configuration
   - Resource plan selection (Basic/Standard/Premium)
   - Website type (WordPress/Drupal/Custom)
   - Database configuration (Internal/External)
   - Admin credentials

2. **Background Processing**

   - Generate Helm values.yaml
   - Create Kubernetes secrets
   - Commit to Git repository
   - Trigger ArgoCD sync
   - Verify deployment status

3. **Resource Plans**
   - **Basic**: 200m CPU / 512Mi RAM / 1Gi Storage
   - **Standard**: 500m CPU / 1Gi RAM / 5Gi Storage
   - **Premium**: 1 CPU / 2Gi RAM / 20Gi Storage

## 🔧 API Endpoints

### Websites

- `GET /api/v1/websites` - List all websites
- `POST /api/v1/websites` - Create new website
- `GET /api/v1/websites/{id}` - Get website details
- `DELETE /api/v1/websites/{id}` - Delete website
- `GET /api/v1/websites/resource-plans` - Get available plans

### Jobs

- `GET /api/v1/jobs` - List jobs with filtering
- `GET /api/v1/jobs/{id}` - Get job details
- `DELETE /api/v1/jobs/{id}` - Cancel job
- `GET /api/v1/jobs/{id}/logs` - Get real-time logs

### Health

- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check

## 🔐 Security Features

- **Kubernetes Secrets**: Automated secret generation and management
- **RBAC Integration**: Role-based access control
- **Input Validation**: Comprehensive request validation with Pydantic
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Isolation**: Namespace-based multi-tenancy

## 📊 Monitoring & Observability

- **Real-time Job Status**: WebSocket-based progress updates
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Health Checks**: Comprehensive health and readiness endpoints
- **Metrics Integration**: Prometheus-compatible metrics (planned)
- **Error Tracking**: Centralized error handling and reporting

## 🚀 Roadmap

- [ ] **Multi-cluster Support**: Deploy across multiple Kubernetes clusters
- [ ] **OIDC Authentication**: Integration with enterprise identity providers
- [ ] **Cost Management**: Resource usage tracking and cost optimization
- [ ] **Backup & Recovery**: Automated website backup solutions
- [ ] **Custom Templates**: User-defined deployment templates
- [ ] **API Rate Limiting**: Enhanced security and performance
- [ ] **Audit Logging**: Comprehensive audit trail
- [ ] **Notification System**: Slack/email integration for deployments

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
- Documentation: [Wiki](../../wiki)

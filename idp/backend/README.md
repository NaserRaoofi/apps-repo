# Website IDP Backend

## FastAPI Backend with Redis Queue

### Requirements

```bash
pip install -r requirements.txt
```

### Development

```bash
# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start the worker (in another terminal)
python -m app.worker
```

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── worker.py            # Redis Queue worker
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── websites.py  # Website management
│   │       ├── jobs.py      # Job status
│   │       └── health.py    # Health checks
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py      # Authentication
│   │   └── database.py      # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── website.py       # Website models
│   │   └── job.py           # Job models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── website_service.py
│   │   ├── terraform_service.py
│   │   └── kubernetes_service.py
│   └── tasks/
│       ├── __init__.py
│       ├── website_tasks.py
│       └── terraform_tasks.py
├── requirements.txt
└── Dockerfile
```

import redis
from app.config import settings
from rq import Queue, Worker

# Redis connection
redis_client = redis.from_url(settings.REDIS_URL)

# Create queues
website_queue = Queue("website", connection=redis_client)
terraform_queue = Queue("terraform", connection=redis_client)


def start_worker():
    """Start RQ worker."""
    worker = Worker([website_queue, terraform_queue], connection=redis_client)
    worker.work()


if __name__ == "__main__":
    start_worker()

#!/bin/bash

# Website IDP Backend Docker Build Script
# Ultra-lightweight FastAPI backend containerization

set -e

# Configuration
IMAGE_NAME="website-idp-backend"
TAG="${1:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "🐳 Building ultra-lightweight Website IDP Backend Docker image..."
echo "📦 Image: ${FULL_IMAGE_NAME}"

# Build the image
echo "🔨 Building Docker image..."
docker build \
    --tag "${FULL_IMAGE_NAME}" \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --progress=plain \
    .

# Get image size
IMAGE_SIZE=$(docker images "${FULL_IMAGE_NAME}" --format "table {{.Size}}" | tail -n 1)
echo "📏 Final image size: ${IMAGE_SIZE}"

# Show image layers (optional)
echo "🔍 Image layers:"
docker history "${FULL_IMAGE_NAME}" --human --format "table {{.CreatedBy}}\t{{.Size}}"

echo "✅ Build complete!"
echo ""
echo "🚀 Quick start commands:"
echo "  # Run container:"
echo "  docker run -p 8000:8000 ${FULL_IMAGE_NAME}"
echo ""
echo "  # Run with docker-compose:"
echo "  docker-compose up -d"
echo ""
echo "  # View logs:"
echo "  docker logs -f idp-backend"
echo ""
echo "  # Stop container:"
echo "  docker-compose down"

# Optional: Push to registry
if [[ "${2}" == "push" ]]; then
    echo "📤 Pushing to registry..."
    docker push "${FULL_IMAGE_NAME}"
    echo "✅ Push complete!"
fi

echo "🎉 Docker image ready!"

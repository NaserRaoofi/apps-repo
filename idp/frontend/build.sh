#!/bin/bash

# Frontend build script for ultra-lightweight Next.js app with Nginx

set -e

echo "🎨 Building ultra-lightweight Website IDP Frontend Docker image..."
echo "📦 Image: website-idp-frontend:latest"

# Build arguments
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:8000"}
NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL:-"ws://localhost:8000"}

echo "🔨 Building Docker image..."
docker build \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_WS_URL="$NEXT_PUBLIC_WS_URL" \
  -t website-idp-frontend:latest \
  .

# Get image size
echo "📏 Final image size: $(docker images website-idp-frontend:latest --format "table {{.Size}}" | tail -n 1)"

# Show image layers
echo "🔍 Image layers:"
docker history website-idp-frontend:latest --format "table {{.CreatedBy}}\t{{.Size}}" | head -20

echo "✅ Build complete!"
echo ""
echo "🚀 Quick start commands:"
echo "  # Run container:"
echo "  docker run -p 3000:80 website-idp-frontend:latest"
echo ""
echo "  # Run with custom API URL:"
echo "  docker run -p 3000:80 -e NEXT_PUBLIC_API_URL=http://your-api:8000 website-idp-frontend:latest"
echo ""
echo "  # View logs:"
echo "  docker logs -f frontend-container"
echo ""
echo "  # Test health endpoint:"
echo "  curl http://localhost:3000/health"
echo ""
echo "🎉 Frontend Docker image ready!"

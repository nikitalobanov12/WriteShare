#!/bin/bash

echo "🚀 Starting Docker containers..."

echo "📦 Starting PostgreSQL container..."
docker start notion_clone-postgres

echo "📦 Starting Redis container..."
docker start notion-clone-redis

echo "✅ Containers started successfully!"
echo "🔍 Checking container status..."
docker ps --filter "name=notion_clone-postgres" --filter "name=notion-clone-redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 
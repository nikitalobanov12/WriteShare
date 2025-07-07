#!/usr/bin/env bash
# Use this script to start a docker container for a local development Redis cache

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop or Podman Desktop
# - Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# - Podman Desktop - https://podman.io/getting-started/installation
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-redis.sh`

# On Linux and macOS you can run this script directly - `./start-redis.sh`

# import env variables from .env
set -a
source .env

REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_CONTAINER_NAME="notion-clone-redis"

if ! [ -x "$(command -v docker)" ] && ! [ -x "$(command -v podman)" ]; then
  echo -e "Docker or Podman is not installed. Please install docker or podman and try again.\nDocker install guide: https://docs.docker.com/engine/install/\nPodman install guide: https://podman.io/getting-started/installation"
  exit 1
fi

# determine which docker command to use
if [ -x "$(command -v docker)" ]; then
  DOCKER_CMD="docker"
elif [ -x "$(command -v podman)" ]; then
  DOCKER_CMD="podman"
fi

if ! $DOCKER_CMD info > /dev/null 2>&1; then
  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
  exit 1
fi

if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$REDIS_PORT" 2>/dev/null; then
    echo "Port $REDIS_PORT is already in use."
    exit 1
  fi
else
  echo "Warning: Unable to check if port $REDIS_PORT is already in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

if [ "$($DOCKER_CMD ps -q -f name=$REDIS_CONTAINER_NAME)" ]; then
  echo "Redis container '$REDIS_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$($DOCKER_CMD ps -q -a -f name=$REDIS_CONTAINER_NAME)" ]; then
  $DOCKER_CMD start "$REDIS_CONTAINER_NAME"
  echo "Existing Redis container '$REDIS_CONTAINER_NAME' started"
  exit 0
fi

echo "Creating new Redis container '$REDIS_CONTAINER_NAME'..."

$DOCKER_CMD run -d \
  --name $REDIS_CONTAINER_NAME \
  -p "$REDIS_PORT":6379 \
  -v redis-data:/data \
  redis:7.4-alpine \
  redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru && \
  echo "Redis container '$REDIS_CONTAINER_NAME' was successfully created"

echo "Redis is running on port $REDIS_PORT"
echo "You can connect to Redis using: redis-cli -h localhost -p $REDIS_PORT" 
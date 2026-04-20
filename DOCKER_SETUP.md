# Docker Setup for Old Linux Devices

Alternative lightweight approach using Docker containers (if your device supports it).

## Prerequisites

- Docker installed
- Docker Compose installed
- 512MB+ RAM
- 500MB+ disk space

## Installation

### Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh

# Add user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Configuration

### 1. Update Docker Compose File

The project already has `docker-compose.prod.yml`. Review it:

```bash
cat docker-compose.prod.yml
```

### 2. Environment Variables

```bash
# Copy and edit
cp server/.env.example server/.env
nano server/.env

# Key settings for Docker:
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb://mongo:27017/expense-tracker
JWT_SECRET=<generate-with-openssl>
CORS_ORIGIN=http://localhost
```

### 3. Build & Run

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Commands

### Container Management

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml stop

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f nginx
docker-compose logs -f server
docker-compose logs -f mongo

# Execute command in container
docker-compose exec server npm test

# Remove everything
docker-compose -f docker-compose.prod.yml down

# Remove including data
docker-compose -f docker-compose.prod.yml down -v
```

### Troubleshooting

```bash
# Check if containers are running
docker ps

# Check all containers (including stopped)
docker ps -a

# View resource usage
docker stats

# Inspect container
docker inspect expense-tracker-server

# Get container IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-id>

# View container logs
docker logs <container-id>

# SSH into container
docker exec -it <container-id> /bin/bash

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# Prune unused images
docker image prune -a

# View images
docker images

# Remove image
docker rmi <image-name>
```

## Performance Optimization for Old Devices

### 1. Limit Container Resources

Edit `docker-compose.prod.yml`:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M

  mongo:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

### 2. Use Alpine Images

Modify Dockerfile for smaller base image:

```dockerfile
# Instead of node:18
FROM node:18-alpine

# ... rest of Dockerfile
```

### 3. Enable Docker Daemon Flags

Edit `/etc/docker/daemon.json`:

```json
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "insecure-registries": [],
  "debug": false
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

## Monitoring

```bash
# Real-time stats
docker stats

# Specific container stats
docker stats <container-name>

# View container processes
docker top <container-id>

# View container changes
docker diff <container-id>

# View container ports
docker port <container-id>

# View network
docker network inspect bridge
```

## Maintenance

```bash
# Clean up unused resources
docker system prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (warning: removes all stopped containers/images)
docker system prune -a --volumes
```

## Deployment Script

Create `docker-deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🐳 Starting Docker deployment..."

# Pull latest code
git pull origin main

# Build images
docker-compose -f docker-compose.prod.yml build

# Stop current containers
docker-compose -f docker-compose.prod.yml stop || true

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Show status
docker-compose ps

echo "✅ Docker deployment complete!"
docker-compose logs -f
```

Make executable:
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

## Issues & Solutions

### Container won't start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### MongoDB connection error
```bash
# Verify MongoDB is running
docker-compose ps mongo

# Check MongoDB logs
docker-compose logs mongo

# Verify connection string in .env
MONGODB_URI=mongodb://mongo:27017/expense-tracker
```

### Out of memory
```bash
# Check resource usage
docker stats

# Reduce memory limits in docker-compose.yml
# Or add to docker-compose.prod.yml:
services:
  server:
    mem_limit: 256m
    memswap_limit: 512m
```

### Port already in use
```bash
# Find process using port
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8080:5000"

# Then access via http://localhost:8080
```

## Comparison: Docker vs Native

| Aspect | Docker | Native |
|--------|--------|--------|
| **Memory** | Slightly higher (~50MB) | Lower |
| **Performance** | Slightly slower | Faster |
| **Setup** | Easier (one command) | More steps |
| **Isolation** | Better (separate env) | None |
| **Cleanup** | Easy (remove containers) | Manual |
| **Updates** | Just rebuild | Pull + reinstall |
| **Portability** | Same on any OS | Different per OS |
| **Old Hardware** | Works but slower | Better choice |

**For old hardware, native installation is recommended** over Docker.

## When to Use Docker

✅ Use Docker if:
- You want clean separation from system
- You plan multi-server deployment
- You need easy backup/restore
- Device has 1GB+ RAM

❌ Don't use Docker if:
- Device has <512MB RAM
- Device has slow storage (HDD)
- You want maximum performance
- Device has limited CPU

## Quick Docker Commands

```bash
# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Stop everything
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Full cleanup and restart
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

---

**For most old Linux devices, use native installation instead of Docker.**

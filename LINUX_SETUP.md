# Expense Tracker - Linux Setup Guide

Complete guide for deploying the Expense Tracker on an old Linux device.

## 📋 System Requirements

### Minimum Specifications (Old Linux Device)
- **CPU**: 1+ GHz processor
- **RAM**: 512 MB minimum (1GB+ recommended)
- **Storage**: 1GB free space
- **Node.js**: v16 or higher (tested with v18)
- **MongoDB**: 3.4 or higher (local) OR MongoDB Atlas (cloud)

### Recommended Linux Distributions
- Ubuntu 18.04+ (LTS recommended for stability)
- Debian 9+
- CentOS 7+
- Raspberry Pi OS (for lightweight devices)

---

## 🚀 Installation Steps

### 1. Update System Packages

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Install Node.js

**Option A: Using NodeSource Repository (Recommended)**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Option B: Using snap (easier, but slower)**
```bash
sudo snap install node --classic
```

**Verify Installation:**
```bash
node --version
npm --version
```

### 3. Install MongoDB

**Option A: Local MongoDB (requires more resources)**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Option B: MongoDB Atlas (Cloud - Recommended for old devices)**
1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/expense-tracker`

**Verify MongoDB Connection:**
```bash
mongo --version
```

### 4. Install Git

```bash
sudo apt-get install -y git
```

### 5. Clone the Project

```bash
git clone https://github.com/ultron0412/Expense-Tracker-Website.git
cd Expense-Tracker-Website
```

---

## ⚙️ Configuration

### 1. Server Environment Setup

Create `server/.env` file:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
# Environment
NODE_ENV=production

# Server
PORT=5000
HOST=0.0.0.0

# Database (Choose one)
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority

# For Local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://your-linux-ip:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Client Environment Setup

Create `client/.env` file:

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation & Build

### 1. Install Dependencies

```bash
# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### 2. Build the Project

```bash
# Build client for production
npm run build:client

# Server doesn't need build, uses Node.js directly
```

---

## ▶️ Running the Application

### Option 1: Development Mode (For Testing)

**Terminal 1 - Backend:**
```bash
npm --prefix server run dev
```

**Terminal 2 - Frontend (optional):**
```bash
npm --prefix client run dev
```

Then access at: `http://localhost:5173`

### Option 2: Production Mode (Recommended for Old Devices)

**Single Terminal - Run Backend Only:**
```bash
NODE_ENV=production npm --prefix server start
```

The backend serves the built frontend automatically at `http://localhost:5000`

### Option 3: Using PM2 (Process Manager)

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Create Ecosystem File** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'expense-tracker',
    script: 'npm',
    args: '--prefix server start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '256M',
    node_args: '--max_old_space_size=256'
  }]
};
```

**Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Monitor:**
```bash
pm2 status
pm2 logs expense-tracker
```

---

## 🔧 Optimization for Old Devices

### 1. Memory Optimization

Add to `.env` or before running:

```bash
# Limit Node.js memory to 256MB
export NODE_OPTIONS="--max_old_space_size=256"

# Run server
npm --prefix server start
```

### 2. Reduce Initial Load

**Disable optional features in production:**
- Remove dev dependencies from deployment
- Use `npm ci` instead of `npm install` for exact versions

```bash
npm ci --prefix server --only=production
npm ci --prefix client --only=production
```

### 3. Database Optimization

**For MongoDB Atlas:**
- Use free tier cluster (sufficient for small usage)
- Enable connection pooling
- Use indexes on frequently queried fields

**For Local MongoDB:**
- Disable journaling if low on storage:
  ```bash
  sudo systemctl stop mongodb
  sudo mongod --nojournal &
  ```

### 4. Nginx Reverse Proxy (Optional but Recommended)

**Install Nginx:**
```bash
sudo apt-get install -y nginx
```

**Configure** (`/etc/nginx/sites-available/expense-tracker`):

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Server tests only
npm --prefix server test

# Client tests only
npm --prefix client test
```

---

## 📱 Access the Application

### Local Access
- **Frontend**: `http://localhost:5000` (production) or `http://localhost:5173` (dev)
- **API**: `http://localhost:5000/api`

### Remote Access (From Another Device)
- Find Linux device IP: `hostname -I`
- Access via: `http://<linux-ip>:5000`

---

## 🔒 Security Setup

### 1. Generate JWT Secret

```bash
openssl rand -base64 32
```

Copy the output to `JWT_SECRET` in `.env`

### 2. Enable Firewall

```bash
sudo ufw enable
sudo ufw allow 80/tcp
sudo ufw allow 5000/tcp
```

### 3. Use HTTPS with Let's Encrypt (Optional)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"
```bash
# Reinstall Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: MongoDB Connection Error
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb

# If using MongoDB Atlas, verify connection string in .env
```

### Issue: Out of Memory
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=512"
npm --prefix server start

# Or permanently add to /etc/environment
NODE_OPTIONS="--max_old_space_size=512"
```

### Issue: Port Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Or use different port
PORT=8080 npm --prefix server start
```

### Issue: Cannot Access from Another Machine
```bash
# Check firewall
sudo ufw status

# Allow port
sudo ufw allow 5000

# Check if listening on all interfaces
netstat -tuln | grep 5000
# Should show 0.0.0.0:5000 or :::5000
```

---

## 📊 Monitoring

### Check Application Status
```bash
# If using PM2
pm2 status

# If running in terminal
# Press Ctrl+C to stop, view logs above
```

### View Logs
```bash
# Server logs
tail -f nohup.out

# With PM2
pm2 logs expense-tracker
```

### Monitor Resources
```bash
# Real-time monitoring
top

# Memory usage
free -h

# Disk usage
df -h

# Process info
ps aux | grep node
```

---

## 🚀 Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Starting Expense Tracker deployment..."

# Stop existing process
pm2 stop expense-tracker 2>/dev/null || true

# Pull latest code
git pull origin main

# Install dependencies
npm ci --prefix server --only=production
npm ci --prefix client --only=production

# Build
npm run build:client

# Start with PM2
pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
echo "Access at: http://localhost:5000"
```

**Make executable:**
```bash
chmod +x deploy.sh
```

**Run anytime:**
```bash
./deploy.sh
```

---

## 💡 Tips for Old Hardware

1. **Use MongoDB Atlas** instead of local MongoDB (saves RAM)
2. **Run in production mode** (more optimized than dev)
3. **Use PM2** for automatic restart and monitoring
4. **Set NODE_OPTIONS** to limit memory
5. **Monitor with `top`** command
6. **Use Nginx** as reverse proxy for better performance
7. **Disable unnecessary logging** in production
8. **Use SSD** instead of HDD if possible

---

## 📝 Quick Reference Commands

```bash
# Start server
npm --prefix server start

# Start with memory limit
NODE_OPTIONS="--max_old_space_size=256" npm --prefix server start

# View logs (PM2)
pm2 logs

# Restart application
pm2 restart expense-tracker

# Stop application
pm2 stop expense-tracker

# Remove application
pm2 delete expense-tracker

# Check status
pm2 status

# View system resources
top
htop
free -h
df -h
```

---

## ✅ Verification Checklist

- [ ] Node.js installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] MongoDB running: `sudo systemctl status mongodb`
- [ ] .env files configured
- [ ] Dependencies installed
- [ ] Server starts: `npm --prefix server start`
- [ ] Can access `http://localhost:5000`
- [ ] Tests pass: `npm test`

---

**That's it! Your Expense Tracker is now running on Linux.** 🎉

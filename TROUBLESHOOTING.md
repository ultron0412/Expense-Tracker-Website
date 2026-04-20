# Old Hardware Troubleshooting Guide

Solutions for common issues on older Linux devices with limited resources.

## 🔴 Critical Issues

### Issue: "Out of Memory" Error

**Symptoms:**
- Application crashes suddenly
- `Error: JavaScript heap out of memory`
- Server stops responding

**Solutions:**

```bash
# 1. Check current memory usage
free -h

# 2. Reduce Node.js memory limit BEFORE running
export NODE_OPTIONS="--max_old_space_size=256"
npm --prefix server start

# 3. Modify ecosystem.config.js for PM2
node_args: '--max_old_space_size=256'

# 4. Disable unnecessary services
sudo systemctl disable cups
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# 5. Check what's consuming memory
ps aux --sort=-%mem | head -n 10

# 6. Kill unnecessary processes
killall firefox
killall chromium
```

### Issue: Application Won't Start

**Symptoms:**
- `npm: command not found`
- `node: command not found`
- Port already in use

**Solutions:**

```bash
# 1. Verify Node.js installation
which node
node --version

# If not found, reinstall:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Check if port is in use
sudo lsof -i :5000

# Kill if needed:
sudo kill -9 $(lsof -ti:5000)

# Or use different port:
PORT=8080 npm --prefix server start

# 3. Verify dependencies installed
npm list --prefix server
npm list --prefix client

# If missing, reinstall:
npm ci --prefix server --only=production
npm ci --prefix client --only=production
```

### Issue: MongoDB Connection Fails

**Symptoms:**
- `Error: connect ECONNREFUSED 127.0.0.1:27017`
- `MongooseError: Cannot connect to MongoDB`
- MongoDB times out

**Solutions:**

```bash
# 1. Check MongoDB status
sudo systemctl status mongodb

# Start if stopped:
sudo systemctl start mongodb

# Restart if stuck:
sudo systemctl restart mongodb

# 2. Check if MongoDB is listening
netstat -tuln | grep 27017

# Should show: tcp 0 0 127.0.0.1:27017

# 3. Verify connection string
# In server/.env:
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# 4. If still failing, use MongoDB Atlas instead
# Register at https://www.mongodb.com/cloud/atlas
# Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
# Update server/.env

# 5. Check MongoDB logs
sudo tail -f /var/log/mongodb/mongodb.log

# 6. Repair MongoDB if corrupted
sudo systemctl stop mongodb
sudo mongod --repair --dbpath /var/lib/mongodb/
sudo systemctl start mongodb
```

## 🟡 Performance Issues

### Issue: Application Runs Very Slowly

**Symptoms:**
- Page takes >5 seconds to load
- CPU at 100%
- High memory usage

**Solutions:**

```bash
# 1. Monitor what's using resources
top

# Press 'M' to sort by memory
# Press 'P' to sort by CPU

# 2. Check disk I/O
iostat -x 1 5

# 3. Disable unnecessary features
# In NODE_ENV=production mode:
# - Reduce logging
# - Disable hot-reload
# - Enable compression

# 4. Optimize Node.js process
NODE_OPTIONS="--max_old_space_size=256 --optimize_for_size --max_semi_space_size=1 --initial_heap_size=32m --finalize_incremental_marking"

# 5. Use PM2 with clustering (1 instance for old hardware)
# ecosystem.config.js:
instances: 1

# 6. Reduce rebuild frequency
# Edit package.json scripts to remove unnecessary tasks

# 7. Check network bandwidth
nethogs

# 8. Disable animations/transitions if CPU heavy
# Edit Tailwind config or CSS
```

### Issue: High CPU Usage

**Symptoms:**
- CPU constantly at 80-100%
- System becomes unresponsive
- Fan running constantly

**Solutions:**

```bash
# 1. Identify CPU hog
ps aux --sort=-%cpu | head -n 10

# 2. Check if Node.js is in a loop
strace -p <PID>

# 3. Reduce polling intervals
# Check MongoDB query optimization

# 4. Disable hot-reload in production
npm --prefix server start  # not npm run dev

# 5. Use single process (no clustering)
# In ecosystem.config.js: instances: 1

# 6. Profile application
node --prof src/server.js
node --prof-process isolate-*.log > profile.txt

# 7. Check for memory leaks
npm install -g clinic
clinic doctor -- npm --prefix server start
```

### Issue: Slow Database Queries

**Symptoms:**
- Dashboard takes long to load
- Transaction list loads slowly
- Search/filter is slow

**Solutions:**

```bash
# 1. Check MongoDB performance
# Connect to MongoDB:
mongo

# Check indexes:
use expense-tracker
db.users.getIndexes()
db.transactions.getIndexes()

# Add indexes if missing:
db.users.createIndex({ email: 1 })
db.transactions.createIndex({ userId: 1 })
db.transactions.createIndex({ date: -1 })
db.transactions.createIndex({ category: 1 })

# 2. Analyze slow queries
db.setProfilingLevel(1)
db.system.profile.find().pretty()

# 3. Enable query optimization in code
# Add hints to queries:
db.transactions.find({ userId: id }).hint({ userId: 1, date: -1 })

# 4. Use pagination
# In TransactionList component: limit results shown

# 5. Cache frequently accessed data
# Use Redis if available (optional)

# 6. Disable unnecessary fields in queries
# Select only needed fields
```

## 🔵 Storage Issues

### Issue: "Disk Space Low" or "No Space Left"

**Symptoms:**
- `Error: ENOSPC: no space left on device`
- MongoDB won't start
- Cannot download dependencies

**Solutions:**

```bash
# 1. Check disk usage
df -h

# 2. Find large files/directories
du -sh /* | sort -h

# 3. Clean npm cache
npm cache clean --force

# 4. Remove old project files
rm -rf node_modules/
npm ci --only=production

# 5. Remove old log files
rm -f ~/.pm2/logs/*

# 6. Clean system
sudo apt-get autoremove
sudo apt-get autoclean
sudo apt-get clean

# 7. Remove temporary files
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# 8. Compress old backups
tar -czf backup-$(date +%Y%m%d).tar.gz backup/
rm -rf backup/

# 9. Check MongoDB data size
du -sh /var/lib/mongodb

# 10. Use external storage (USB drive)
sudo mount /dev/usb0 /mnt/usb
ln -s /mnt/usb/data ./data
```

## 🟠 Network Issues

### Issue: Cannot Access Application from Another Device

**Symptoms:**
- `Connection refused`
- `Cannot reach server`
- Works on localhost but not from other machine

**Solutions:**

```bash
# 1. Check if listening on all interfaces
netstat -tuln | grep 5000
# Should show: 0.0.0.0:5000

# 2. Check firewall
sudo ufw status

# If enabled, allow port:
sudo ufw allow 5000

# 3. Check binding in .env
HOST=0.0.0.0  # Not 127.0.0.1

# 4. Find Linux device IP
hostname -I

# 5. Test from another device
curl http://<linux-ip>:5000

# 6. Check if process is running
ps aux | grep node

# 7. View network interfaces
ip addr show

# 8. Check if proxy/firewall blocks port
sudo iptables -L -n | grep 5000

# 9. Temporarily disable firewall (for testing)
sudo ufw disable

# 10. Test with explicit port
sudo netstat -tulpn | grep 5000
```

### Issue: Cannot Connect to MongoDB Atlas

**Symptoms:**
- `MongooseError: connect ECONNREFUSED`
- `MongoError: authentication failed`
- Timeout connecting to cluster

**Solutions:**

```bash
# 1. Verify connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database

# 2. Check MongoDB Atlas IP whitelist
# Login to https://cloud.mongodb.com
# Security -> Network Access -> Add IP Address
# For testing: Add 0.0.0.0/0 (allow all)

# 3. Verify credentials
# Copy connection string exactly from Atlas

# 4. Check internet connectivity
ping 8.8.8.8

# 5. Test DNS resolution
nslookup cluster.mongodb.net

# 6. Verify credentials in .env
echo $MONGODB_URI

# 7. Test connection manually
npm install -g mongodb-shell
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/test"

# 8. Check firewall allows outgoing 27017
sudo ufw status

# 9. Try with timeout
# Add to .env: MONGOOSE_CONNECT_TIMEOUT=10000

# 10. Use MongoDB Atlas free tier (sufficient for testing)
```

## 🟢 Installation Issues

### Issue: npm install Fails

**Symptoms:**
- `ERR! install Couldn't read dependencies`
- `ERR! notsup Unsupported platform`
- `EACCES: permission denied`

**Solutions:**

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Verify npm installation
npm --version

# Reinstall if needed:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Fix permissions
sudo chown -R $(whoami) ~/.npm

# 4. Use ci instead of install (production)
npm ci --prefix server --only=production
npm ci --prefix client --only=production

# 5. Install system dependencies
sudo apt-get install -y build-essential python3

# 6. Clear and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 7. Check Node version compatibility
node --version
npm list node-gyp

# 8. Upgrade npm
npm install -g npm@latest

# 9. Try offline install
npm ci --offline --prefer-offline

# 10. Check disk space
df -h
```

### Issue: Build Fails

**Symptoms:**
- `npm run build:client` fails
- `Vite build error`
- `Module not found`

**Solutions:**

```bash
# 1. Clear build cache
rm -rf client/dist
rm -rf .vite-cache

# 2. Reinstall dependencies
rm -rf client/node_modules
npm ci --prefix client --only=production

# 3. Check Node version
node --version  # Should be 16+

# 4. View build logs
npm run build:client 2>&1 | tee build.log

# 5. Try verbose build
npm --prefix client run build -- --debug

# 6. Increase memory for build
NODE_OPTIONS="--max_old_space_size=512" npm run build:client

# 7. Check for missing dependencies
npm list --prefix client

# 8. Rebuild native modules
npm rebuild --prefix client

# 9. Check for circular dependencies
npm audit --prefix client

# 10. Try build in parts
npm run build:client -- --sourcemap
```

## Quick Recovery Steps

If application breaks, follow this checklist:

```bash
# 1. Check if running
ps aux | grep node

# 2. View recent errors
pm2 logs expense-tracker

# 3. Check resources
free -h
df -h

# 4. Restart application
pm2 restart expense-tracker

# 5. If still broken, reinstall
npm ci --prefix server --only=production
npm ci --prefix client --only=production
npm run build:client

# 6. Clear caches
npm cache clean --force
rm -rf ~/.pm2

# 7. Check dependencies
npm list

# 8. Verify configuration
cat server/.env | grep -E "MONGODB|JWT|PORT"

# 9. Test API
curl http://localhost:5000/api/health

# 10. Check logs again
pm2 logs
```

## Getting Help

If stuck, collect diagnostic info:

```bash
# Create diagnostic file
{
  echo "=== System Info ==="
  uname -a
  echo ""
  echo "=== Memory ==="
  free -h
  echo ""
  echo "=== Disk ==="
  df -h
  echo ""
  echo "=== Node/npm ==="
  node --version
  npm --version
  echo ""
  echo "=== Running Processes ==="
  ps aux | grep node
  echo ""
  echo "=== MongoDB Status ==="
  sudo systemctl status mongodb
  echo ""
  echo "=== Recent Errors ==="
  pm2 logs --err
} > diagnostic-$(date +%Y%m%d).txt

# Share this file for support
cat diagnostic-*.txt
```

---

**Most issues on old hardware are related to memory and disk space. Keep these optimized!**

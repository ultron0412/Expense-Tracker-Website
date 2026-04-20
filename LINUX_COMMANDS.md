# Quick Linux Commands Reference

## Setup & Installation

```bash
# One-command setup (automated)
sudo bash setup-linux.sh

# Manual installation
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git mongodb
git clone https://github.com/ultron0412/Expense-Tracker-Website.git
cd Expense-Tracker-Website
npm ci --prefix server --only=production
npm ci --prefix client --only=production
npm run build:client
```

## Environment Setup

```bash
# Create .env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit configuration
nano server/.env
nano client/.env

# Generate JWT Secret
openssl rand -base64 32
```

## Running the Application

### Production Mode (Recommended)
```bash
# Simple - just run server (serves frontend automatically)
NODE_OPTIONS="--max_old_space_size=256" npm --prefix server start

# With PM2 (auto-restart, monitoring)
pm2 start ecosystem.config.js
pm2 logs
pm2 status
```

### Development Mode (Testing)
```bash
# Terminal 1: Start backend
npm --prefix server run dev

# Terminal 2: Start frontend dev server
npm --prefix client run dev

# Access: http://localhost:5173
```

## System Management

### Process Management (PM2)
```bash
# Start application
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs expense-tracker

# Stop
pm2 stop expense-tracker

# Restart
pm2 restart expense-tracker

# Delete
pm2 delete expense-tracker

# Save for restart
pm2 save
pm2 startup
```

### Service Management
```bash
# MongoDB
sudo systemctl start mongodb
sudo systemctl stop mongodb
sudo systemctl restart mongodb
sudo systemctl status mongodb

# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

## Monitoring

```bash
# Real-time CPU/Memory
top

# Interactive process monitor
htop

# Memory usage
free -h

# Disk usage
df -h

# Network connections
netstat -tuln | grep 5000

# View open files
lsof -i :5000

# Process list
ps aux | grep node

# Kill process
sudo kill -9 <PID>
```

## Database Management

### MongoDB Local
```bash
# Connect to MongoDB
mongo

# List databases
show dbs

# Select database
use expense-tracker

# List collections
show collections

# View data
db.users.find()
db.transactions.find()

# Count documents
db.transactions.count()
```

### MongoDB Atlas (Cloud)
```bash
# Test connection
npm --prefix server start

# Connection string format
mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
```

## Troubleshooting

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB status
sudo systemctl status mongodb

# View server logs
pm2 logs expense-tracker

# Restart all
pm2 restart all

# Out of memory - increase limit
export NODE_OPTIONS="--max_old_space_size=512"

# Check if port is in use
sudo lsof -i :5000

# Kill process on port
sudo kill -9 $(lsof -ti:5000)

# Test API
curl http://localhost:5000/api/health

# Check server response
curl -i http://localhost:5000

# View recent errors
tail -n 50 ~/.pm2/logs/expense-tracker-error.log
```

## Updates & Maintenance

```bash
# Update code from repository
git pull origin main

# Reinstall dependencies
npm ci --prefix server --only=production
npm ci --prefix client --only=production

# Rebuild frontend
npm run build:client

# Clear npm cache
npm cache clean --force

# Verify no issues
npm test
```

## Deployment

```bash
# One-time deploy
./deploy.sh

# Schedule regular updates (cron)
crontab -e

# Add this line (check updates every Sunday at 2 AM)
0 2 * * 0 cd /path/to/Expense-Tracker-Website && ./deploy.sh >> /var/log/expense-tracker-deploy.log 2>&1
```

## Useful Aliases

Add to `~/.bashrc`:

```bash
alias app-start="pm2 start ecosystem.config.js"
alias app-stop="pm2 stop expense-tracker"
alias app-restart="pm2 restart expense-tracker"
alias app-logs="pm2 logs expense-tracker"
alias app-status="pm2 status"
alias app-kill="sudo kill -9 $(lsof -ti:5000)"
alias app-check="curl http://localhost:5000/api/health"

# Activate with:
source ~/.bashrc
```

## Linux Tips for Old Devices

```bash
# Disable unnecessary services to free RAM
sudo systemctl disable cups           # Printing
sudo systemctl disable avahi-daemon  # Bonjour/mDNS
sudo systemctl disable bluetooth      # Bluetooth

# View memory usage
free -h

# Check what's using memory
ps aux --sort=-%mem | head -n 10

# Optimize disk usage
sudo apt-get autoremove
sudo apt-get autoclean

# Find large files
du -sh /* | sort -h

# Check system uptime
uptime

# View system info
uname -a
cat /etc/os-release
```

## Security

```bash
# Generate strong JWT secret
openssl rand -base64 32

# Change file permissions
chmod 600 server/.env
chmod 600 client/.env

# Check who can access
ls -la server/.env

# Setup firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 5000/tcp
sudo ufw status

# Check open ports
sudo netstat -tuln

# Monitor failed login attempts
sudo tail -f /var/log/auth.log | grep Failed
```

## Backup & Restore

```bash
# Backup project
tar -czf expense-tracker-backup.tar.gz Expense-Tracker-Website/

# Backup database
mongodump --db expense-tracker --out backup/

# Restore database
mongorestore --db expense-tracker backup/expense-tracker/

# Backup environment files
cp server/.env server/.env.backup
cp client/.env client/.env.backup
```

## Remote Access

```bash
# Find device IP
hostname -I

# SSH into device (from another computer)
ssh user@<device-ip>

# Copy files via SCP
scp file.txt user@<device-ip>:/home/user/

# SSH without password (setup key)
ssh-keygen -t rsa -b 4096
ssh-copy-id user@<device-ip>
```

## Docker Alternative (if installed)

```bash
# Build Docker image
docker compose -f docker-compose.prod.yml build

# Start containers
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Restart
docker compose restart
```

---

**Save this file and refer back whenever you need a command!**

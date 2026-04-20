# 🚀 Quick Start - Linux Deployment

**5-minute setup for Expense Tracker on Linux**

## Pre-Check (60 seconds)

```bash
# Is Node.js installed?
node --version

# If not, run setup first (see below)
```

## Option 1: Automated Setup (Recommended) ⭐

```bash
# Single command setup
sudo bash setup-linux.sh

# Follow prompts, then:
pm2 logs expense-tracker

# Access: http://localhost:5000
```

✅ **Easiest method** - handles everything automatically

## Option 2: Manual Quick Setup (3 minutes)

### Step 1: Install Prerequisites
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### Step 2: Get Project
```bash
git clone https://github.com/ultron0412/Expense-Tracker-Website.git
cd Expense-Tracker-Website
```

### Step 3: Configure
```bash
# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit if using MongoDB Atlas:
nano server/.env
# Change: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
```

### Step 4: Build & Run
```bash
# Install dependencies
npm ci --prefix server --only=production
npm ci --prefix client --only=production

# Build frontend
npm run build:client

# Start server
NODE_ENV=production npm --prefix server start

# Access: http://localhost:5000
```

✅ **Manual method** - understand each step

## Option 3: Docker Setup (Advanced)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh

# Then:
docker-compose -f docker-compose.prod.yml up -d
docker-compose logs -f
```

⚠️ **Not recommended for old hardware** - uses more resources

---

## ✅ Verification (30 seconds)

```bash
# Test API (should return 200 OK)
curl http://localhost:5000/api/health

# Access from browser
http://localhost:5000

# Create account and test
```

---

## 📋 What You'll See

**First Time Login:**
- Create account with email/password
- Add your first transaction
- View dashboard with charts

**System:**
- Backend running on port 5000
- MongoDB storing data
- Frontend serving at http://localhost:5000

---

## 🔧 Common Commands After Setup

```bash
# View logs
pm2 logs expense-tracker

# Restart
pm2 restart expense-tracker

# Stop
pm2 stop expense-tracker

# Check status
pm2 status
```

---

## 🆘 If Something Goes Wrong

### "npm: command not found"
```bash
# Reinstall Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### "Cannot connect to MongoDB"
```bash
# Start MongoDB
sudo systemctl start mongodb

# Or use MongoDB Atlas (free cloud option)
# Get string from https://www.mongodb.com/cloud/atlas
# Update MONGODB_URI in server/.env
```

### "Out of memory"
```bash
# Reduce memory usage
export NODE_OPTIONS="--max_old_space_size=256"
npm --prefix server start
```

### "Port already in use"
```bash
# Use different port
PORT=8080 npm --prefix server start
# Access: http://localhost:8080
```

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| `LINUX_SETUP.md` | Complete setup guide with all options |
| `LINUX_COMMANDS.md` | All useful commands reference |
| `DOCKER_SETUP.md` | Docker containerization guide |
| `TROUBLESHOOTING.md` | Solutions for common issues |

## 🎯 Next Steps

1. **Run automated setup:**
   ```bash
   sudo bash setup-linux.sh
   ```

2. **Access application:**
   ```
   http://localhost:5000
   ```

3. **Create account & test:**
   - Sign up with email/password
   - Add transactions
   - View charts

4. **Optional:**
   - Access from other devices: `http://<device-ip>:5000`
   - Setup SSL/HTTPS for security
   - Enable automatic backups

---

## 📊 Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|------------|
| RAM | 512 MB | 1 GB |
| Storage | 1 GB | 2+ GB |
| CPU | 1 GHz | 1.5+ GHz |
| Network | Broadband | Broadband |

---

## 🆘 Still Need Help?

1. Check `TROUBLESHOOTING.md` for your specific issue
2. Review logs: `pm2 logs expense-tracker`
3. Test API: `curl http://localhost:5000/api/health`
4. Check resources: `free -h` and `df -h`

---

**That's it! You're ready to run Expense Tracker on Linux! 🎉**

---

## Device IP Address

To access from another computer on the network:

```bash
hostname -I
```

Then use: `http://<your-device-ip>:5000`

---

## Production Tips for Old Devices

✅ **Do:**
- Use production mode (`NODE_ENV=production`)
- Enable PM2 for auto-restart
- Use MongoDB Atlas (saves RAM)
- Monitor with `pm2 status`
- Set memory limits

❌ **Don't:**
- Run in development mode
- Use Docker on old hardware
- Enable all logging
- Run multiple processes
- Disable firewall entirely

---

**Choose your setup method above and start deploying! 🚀**

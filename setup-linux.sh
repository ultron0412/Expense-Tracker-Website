#!/bin/bash

# Expense Tracker - Automated Linux Setup Script
# Usage: sudo bash setup-linux.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   print_info "Usage: sudo bash setup-linux.sh"
   exit 1
fi

# Start installation
print_header "Expense Tracker - Linux Setup"

# 1. Update System
print_header "Step 1: Updating System Packages"
apt-get update > /dev/null 2>&1
apt-get upgrade -y > /dev/null 2>&1
print_success "System packages updated"

# 2. Install Node.js
print_header "Step 2: Installing Node.js"
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# 3. Install Git
print_header "Step 3: Installing Git"
if ! command -v git &> /dev/null; then
    apt-get install -y git > /dev/null 2>&1
    print_success "Git installed"
else
    print_success "Git already installed"
fi

# 4. Install MongoDB (Optional)
print_header "Step 4: MongoDB Setup"
read -p "Install local MongoDB? (y/n, skip for MongoDB Atlas): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v mongod &> /dev/null; then
        print_info "Installing MongoDB..."
        apt-get install -y mongodb > /dev/null 2>&1
        systemctl start mongodb
        systemctl enable mongodb > /dev/null 2>&1
        print_success "MongoDB installed and started"
    else
        print_success "MongoDB already installed"
        systemctl start mongodb 2>/dev/null || true
    fi
else
    print_warning "Skipping MongoDB. You must configure MongoDB Atlas in .env"
fi

# 5. Install PM2 (Optional)
print_header "Step 5: Process Manager (PM2)"
read -p "Install PM2 for process management? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Installing PM2 globally..."
    npm install -g pm2 > /dev/null 2>&1
    print_success "PM2 installed"
fi

# 6. Install Nginx (Optional)
print_header "Step 6: Web Server (Nginx)"
read -p "Install Nginx as reverse proxy? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v nginx &> /dev/null; then
        print_info "Installing Nginx..."
        apt-get install -y nginx > /dev/null 2>&1
        systemctl enable nginx > /dev/null 2>&1
        print_success "Nginx installed"
    else
        print_success "Nginx already installed"
    fi
fi

# 7. Clone/Update Repository
print_header "Step 7: Project Setup"
if [ ! -d "Expense-Tracker-Website" ]; then
    print_info "Cloning repository..."
    git clone https://github.com/ultron0412/Expense-Tracker-Website.git > /dev/null 2>&1
    print_success "Repository cloned"
else
    print_info "Repository already exists. Updating..."
    cd Expense-Tracker-Website
    git pull origin main > /dev/null 2>&1
    cd ..
    print_success "Repository updated"
fi

cd Expense-Tracker-Website

# 8. Install Dependencies
print_header "Step 8: Installing Node Dependencies"
print_info "Installing server dependencies..."
npm ci --prefix server --only=production > /dev/null 2>&1
print_success "Server dependencies installed"

print_info "Installing client dependencies..."
npm ci --prefix client --only=production > /dev/null 2>&1
print_success "Client dependencies installed"

# 9. Build Frontend
print_header "Step 9: Building Frontend"
npm run build:client > /dev/null 2>&1
print_success "Frontend built successfully"

# 10. Environment Setup
print_header "Step 10: Environment Configuration"

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

if [ ! -f "server/.env" ]; then
    print_info "Creating server/.env..."
    cat > server/.env << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    print_success "server/.env created"
    print_warning "⚠️  IMPORTANT: Edit server/.env to configure MongoDB:"
    print_warning "   For MongoDB Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker"
else
    print_warning "server/.env already exists (not overwriting)"
fi

if [ ! -f "client/.env" ]; then
    print_info "Creating client/.env..."
    cat > client/.env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    print_success "client/.env created"
else
    print_warning "client/.env already exists (not overwriting)"
fi

# 11. Setup PM2 (if installed)
if command -v pm2 &> /dev/null; then
    print_header "Step 11: Setting up PM2"
    cat > ecosystem.config.js << EOF
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
EOF
    pm2 start ecosystem.config.js > /dev/null 2>&1
    pm2 save > /dev/null 2>&1
    pm2 startup > /dev/null 2>&1
    print_success "PM2 configured and application started"
    print_info "View logs: pm2 logs expense-tracker"
    print_info "Check status: pm2 status"
fi

# 12. Setup Nginx (if installed)
if command -v nginx &> /dev/null; then
    print_header "Step 12: Configuring Nginx"
    cat > /etc/nginx/sites-available/expense-tracker << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    rm -f /etc/nginx/sites-enabled/expense-tracker
    ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
    
    if nginx -t 2>&1 | grep -q "successful"; then
        systemctl restart nginx > /dev/null 2>&1
        print_success "Nginx configured and restarted"
    else
        print_warning "Nginx configuration has errors, please review"
    fi
fi

# 13. Setup Firewall
print_header "Step 13: Firewall Configuration"
if command -v ufw &> /dev/null; then
    read -p "Enable UFW firewall? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ufw --force enable > /dev/null 2>&1
        ufw allow 22/tcp > /dev/null 2>&1
        ufw allow 80/tcp > /dev/null 2>&1
        ufw allow 5000/tcp > /dev/null 2>&1
        print_success "Firewall enabled and ports opened"
    fi
fi

# Final Summary
print_header "Installation Complete! 🎉"
print_success "Expense Tracker is ready on Linux"
print_info ""
print_info "📌 Next Steps:"
print_info "1. Edit configuration files:"
echo -e "   ${YELLOW}nano server/.env${NC}"
print_info "2. Verify MongoDB connection (if using local MongoDB):"
echo -e "   ${YELLOW}sudo systemctl status mongodb${NC}"
print_info "3. Start the application:"
if command -v pm2 &> /dev/null; then
    echo -e "   ${YELLOW}pm2 logs expense-tracker${NC}"
else
    echo -e "   ${YELLOW}NODE_ENV=production npm --prefix server start${NC}"
fi
print_info "4. Access the app:"
echo -e "   ${YELLOW}http://localhost:5000${NC}"
print_info ""
print_info "📚 Documentation:"
echo -e "   ${YELLOW}cat LINUX_SETUP.md${NC}"
print_info ""
print_info "Device IP (for remote access):"
hostname -I
echo ""

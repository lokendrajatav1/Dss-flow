# Deployment Guide for DSS FLOW CRM
### Target: Hostinger KVM 4 VPS (4 vCPU, 16 GB RAM, 200 GB NVMe, Ubuntu)

### Your Production Domains:
- **Frontend App**: `https://dssflow.digitalsuccesssolutions.in`
- **Backend API & WebSockets**: `https://api-crm.digitalsuccesssolutions.in`

---

## Step 0: DNS Record Setup (Domain Manager)
Apne DNS provider (Hostinger / Cloudflare / GoDaddy) me **2 DNS A Records** add karein:

| Type | Name / Subdomain | Points To (Value) | TTL |
|---|---|---|---|
| **A** | `dssflow` | `YOUR_HOSTINGER_VPS_IP` | 300 / Auto |
| **A** | `api-crm` | `YOUR_HOSTINGER_VPS_IP` | 300 / Auto |

*(Replace `YOUR_HOSTINGER_VPS_IP` with your actual VPS IP address)*

---

## Step 1: Connect to your Hostinger VPS via SSH
Open your terminal (PowerShell, Command Prompt, or Mac Terminal) and run:
```bash
ssh root@YOUR_HOSTINGER_VPS_IP
```
*(Enter your VPS root password)*

---

## Step 2: System Update & Essential Tools Installation
Run this command to update packages and install git, Nginx, and Certbot (SSL):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx
```

### Install Chromium dependencies (for WhatsApp Web Puppeteer background process):
```bash
sudo apt install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
  libpango-1.0-0 libasound2 libpangocairo-1.0-0 libxshmfence1
```

---

## Step 3: Install Node.js 20, pnpm & PM2
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm and PM2 globally
npm install -g pnpm pm2
```

Verify:
```bash
node -v   # v20.x.x
pnpm -v   # 9.x.x
pm2 -v    # 5.x.x
```

---

## Step 4: Clone Your Project on VPS
```bash
mkdir -p /var/www/dssflow
cd /var/www/dssflow

# Clone your GitHub repository:
git clone YOUR_GITHUB_REPO_URL .
```

---

## Step 5: Configure Environment Variables

### 1. Backend `.env`:
```bash
nano apps/api/.env
```
Paste your production settings:
```env
PORT=4000
NODE_ENV="production"
DATABASE_URL="your-postgresql-database-url-here"
JWT_SECRET="your-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```
*(Save with `Ctrl + O` then `Enter`, exit with `Ctrl + X`)*

### 2. Frontend `.env.production`:
```bash
nano apps/web/.env.production
```
Make sure it has:
```env
VITE_API_URL=https://api-crm.digitalsuccesssolutions.in/api/v1
VITE_SOCKET_URL=https://api-crm.digitalsuccesssolutions.in
VITE_FACEBOOK_APP_ID=2520039771825254
```
*(Save with `Ctrl + O` then `Enter`, exit with `Ctrl + X`)*

---

## Step 6: Install Dependencies & Build
From root `/var/www/dssflow`:
```bash
# 1. Install all dependencies
pnpm install

# 2. Sync database schema & generate Prisma client
cd apps/api
npx prisma generate
cd ../..

# 3. Build backend & frontend
pnpm run build
```

---

## Step 7: Start Backend with PM2 (24x7 Background Daemon)
```bash
# Start backend using pre-configured ecosystem file
pm2 start ecosystem.config.js

# Setup PM2 to auto-start on server reboot
pm2 startup
pm2 save
```

Check status:
```bash
pm2 status
pm2 logs crm-api
```

---

## Step 8: Configure Nginx for Both Subdomains
```bash
# 1. Copy pre-configured Nginx config
sudo cp nginx.conf.example /etc/nginx/sites-available/dssflow

# 2. Enable the site
sudo ln -s /etc/nginx/sites-available/dssflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Test and reload Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Install Free SSL Certificate (HTTPS)
Run Certbot to activate free HTTPS encryption for both subdomains in one command:
```bash
sudo certbot --nginx -d dssflow.digitalsuccesssolutions.in -d api-crm.digitalsuccesssolutions.in
```
*(Enter your email address, accept terms, and Certbot will automatically install SSL certificates and configure HTTPS redirects!)*

---

## 🎉 Aapka CRM Live Ho Gaya!

- 🌐 **Frontend Web App**: `https://dssflow.digitalsuccesssolutions.in`
- ⚙️ **Backend REST API**: `https://api-crm.digitalsuccesssolutions.in/api/v1`
- 💬 **Real-time WebSockets & WhatsApp**: `https://api-crm.digitalsuccesssolutions.in/socket.io`

### 💡 Useful Commands for Future:
- **PM2 Restart**: `pm2 restart crm-api`
- **PM2 Logs**: `pm2 logs crm-api`
- **Update Code after Git Push**:
  ```bash
  cd /var/www/dssflow
  git pull
  pnpm install
  pnpm run build
  pm2 restart crm-api
  ```

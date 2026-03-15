#!/usr/bin/env bash
# HomeoClinic Pro — One-time DigitalOcean droplet setup
# Run as root: bash scripts/setup-server.sh
set -euo pipefail

REPO_URL="https://github.com/CarlosHonorato70/HomeoClinicPro-Projeto.git"
APP_DIR="/opt/homeoclinic/app"
DATA_DIR="/opt/homeoclinic/data"
BACKUP_DIR="/opt/homeoclinic/backups"
APP_USER="homeoclinic"

echo "============================================"
echo "  HomeoClinic Pro — Server Setup"
echo "============================================"

# -------------------------------------------------------------------
# 1. Check root
# -------------------------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: This script must be run as root."
  exit 1
fi

# -------------------------------------------------------------------
# 2. System update & essential packages
# -------------------------------------------------------------------
echo ""
echo "[1/9] Installing system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl git ufw fail2ban htop nginx certbot python3-certbot-nginx \
  ca-certificates gnupg lsb-release

# -------------------------------------------------------------------
# 3. Install Docker
# -------------------------------------------------------------------
echo ""
echo "[2/9] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
else
  echo "  Docker already installed: $(docker --version)"
fi

# Ensure docker compose plugin is available
if ! docker compose version &> /dev/null; then
  apt-get install -y -qq docker-compose-plugin
fi

systemctl enable docker
systemctl start docker

# -------------------------------------------------------------------
# 4. Create app user
# -------------------------------------------------------------------
echo ""
echo "[3/9] Creating app user '$APP_USER'..."
if id "$APP_USER" &>/dev/null; then
  echo "  User '$APP_USER' already exists"
else
  adduser --system --group --home /opt/homeoclinic --shell /bin/bash "$APP_USER"
  usermod -aG docker "$APP_USER"

  # Copy root's SSH keys for the app user
  if [ -f /root/.ssh/authorized_keys ]; then
    mkdir -p /opt/homeoclinic/.ssh
    cp /root/.ssh/authorized_keys /opt/homeoclinic/.ssh/
    chown -R "$APP_USER:$APP_USER" /opt/homeoclinic/.ssh
    chmod 700 /opt/homeoclinic/.ssh
    chmod 600 /opt/homeoclinic/.ssh/authorized_keys
  fi
fi

# -------------------------------------------------------------------
# 5. Create swap (2GB)
# -------------------------------------------------------------------
echo ""
echo "[4/9] Configuring swap..."
if [ -f /swapfile ]; then
  echo "  Swap already exists"
else
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "  2GB swap created"
fi

# Optimize swappiness for production
sysctl vm.swappiness=10
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf

# -------------------------------------------------------------------
# 6. Firewall
# -------------------------------------------------------------------
echo ""
echo "[5/9] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
echo "y" | ufw enable
ufw status

# -------------------------------------------------------------------
# 7. Clone repo & create directories
# -------------------------------------------------------------------
echo ""
echo "[6/9] Cloning repository..."
mkdir -p "$DATA_DIR" "$BACKUP_DIR"

if [ -d "$APP_DIR/.git" ]; then
  echo "  Repository already exists, pulling latest..."
  cd "$APP_DIR"
  git pull origin main || git pull origin master
else
  git clone "$REPO_URL" "$APP_DIR"
fi

chown -R "$APP_USER:$APP_USER" /opt/homeoclinic

# -------------------------------------------------------------------
# 8. Generate secrets & create .env.production
# -------------------------------------------------------------------
echo ""
echo "[7/9] Generating secrets..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '=+/' | head -c 32)

ENV_FILE="$APP_DIR/.env.production"

if [ -f "$ENV_FILE" ]; then
  echo "  .env.production already exists — skipping (delete it to regenerate)"
else
  cat > "$ENV_FILE" << ENVEOF
# HomeoClinic Pro — Production Environment
# Generated on $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Database (auto-configured for Docker Compose)
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/homeoclinic"
DIRECT_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/homeoclinic"

# Docker Compose PostgreSQL
POSTGRES_DB="homeoclinic"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"

# Auth (auto-generated)
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://CHANGE_ME_YOUR_DOMAIN.com"

# Encryption — LGPD AES-256-GCM (auto-generated)
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# Email — Brevo (https://app.brevo.com/settings/keys/api)
# TODO: Get your API key from Brevo dashboard
BREVO_API_KEY=""
EMAIL_FROM="HomeoClinic Pro <noreply@CHANGE_ME_YOUR_DOMAIN.com>"

# Payments — Stripe (https://dashboard.stripe.com/apikeys)
# TODO: Get your keys from Stripe dashboard
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_PROFESSIONAL=""
STRIPE_PRICE_ENTERPRISE=""

# Redis (auto-configured for Docker Compose)
REDIS_URL="redis://redis:6379"

# Monitoring — Sentry (https://sentry.io/settings/account/api/auth-tokens/)
# TODO: Optional — fill in for error tracking
SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
SENTRY_ORG=""
SENTRY_PROJECT=""

# Environment
NODE_ENV="production"
ENVEOF

  chmod 600 "$ENV_FILE"
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  echo "  .env.production created with auto-generated secrets"
fi

# -------------------------------------------------------------------
# 9. Configure Nginx
# -------------------------------------------------------------------
echo ""
echo "[8/9] Configuring Nginx..."
cp "$APP_DIR/scripts/nginx.conf" /etc/nginx/sites-available/homeoclinic
ln -sf /etc/nginx/sites-available/homeoclinic /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Create proxy_params if it doesn't exist
if [ ! -f /etc/nginx/proxy_params ]; then
  cat > /etc/nginx/proxy_params << 'PROXYEOF'
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
proxy_set_header Connection "";
PROXYEOF
fi

nginx -t && systemctl reload nginx
systemctl enable nginx

# -------------------------------------------------------------------
# 10. Cron for daily backup
# -------------------------------------------------------------------
echo ""
echo "[9/9] Setting up daily backup cron..."
CRON_LINE="0 3 * * * /opt/homeoclinic/app/scripts/backup.sh >> /opt/homeoclinic/backups/backup.log 2>&1"

# Add cron for the app user (avoid duplicates)
(crontab -u "$APP_USER" -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_LINE") | crontab -u "$APP_USER" -

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "  1. Edit .env.production with your API keys:"
echo "     nano $ENV_FILE"
echo ""
echo "  2. Set NEXTAUTH_URL to your domain:"
echo "     (e.g., https://homeoclinic-ia.com)"
echo ""
echo "  3. Upload data files for seeding:"
echo "     scp repertory.json root@YOUR_IP:$DATA_DIR/"
echo "     scp correlatos.json root@YOUR_IP:$DATA_DIR/"
echo ""
echo "  4. Run the first deploy:"
echo "     su - $APP_USER"
echo "     cd $APP_DIR"
echo "     bash scripts/deploy.sh --seed"
echo ""
echo "  5. Set up SSL (after DNS is pointing here):"
echo "     certbot --nginx -d yourdomain.com"
echo ""
echo "  Postgres password: ${POSTGRES_PASSWORD}"
echo "  (also saved in .env.production)"
echo ""

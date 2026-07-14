#!/bin/bash
# AfroStore Deployment Script
# Usage: ./scripts/deploy.sh [command]
# Commands: setup, deploy, ssl-init, ssl-renew, domain-add, domain-remove

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAINS_DIR="$APP_DIR/nginx/conf.d/domains"
COMPOSE="docker compose -f $APP_DIR/docker-compose.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Initial Setup ───────────────────────────────────────────
setup() {
    log "Setting up AfroStore..."

    # Check Docker
    command -v docker >/dev/null 2>&1 || err "Docker not found. Install Docker first."
    command -v docker compose >/dev/null 2>&1 || err "Docker Compose not found."

    # Create directories
    mkdir -p "$DOMAINS_DIR"
    mkdir -p "$APP_DIR/nginx/conf.d"

    # Create .env if missing
    if [ ! -f "$APP_DIR/.env" ]; then
        cat > "$APP_DIR/.env" << 'EOF'
DATABASE_URL=postgresql://user:password@db:5432/afrostore
JWT_SECRET=change-me-to-a-random-string
SERVER_IP=YOUR_SERVER_IP
CNAME_TARGET=cname.afrostore.com
NEXT_PUBLIC_APP_DOMAIN=afrostore.com
EOF
        warn "Created .env file — edit it with your actual values!"
    fi

    log "Setup complete!"
}

# ─── Deploy / Update ─────────────────────────────────────────
deploy() {
    log "Deploying AfroStore..."
    cd "$APP_DIR"

    # Pull latest
    git pull origin main 2>/dev/null || warn "Git pull failed (maybe not a git repo)"

    # Build and restart
    $COMPOSE build --no-cache app
    $COMPOSE up -d

    log "Deployment complete!"
    log "App: http://localhost:3000"
    log "Nginx: http://localhost (port 80/443)"
}

# ─── SSL Init (first time) ───────────────────────────────────
ssl_init() {
    DOMAIN="${1:?Usage: deploy.sh ssl-init <domain>}"
    log "Initializing SSL for $DOMAIN..."

    # Start nginx without SSL first
    $COMPOSE up -d nginx

    # Get certificate
    $COMPOSE run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN

    # Reload nginx with SSL
    $COMPOSE exec nginx nginx -s reload

    log "SSL certificate obtained for $DOMAIN!"
}

# ─── SSL Renew ────────────────────────────────────────────────
ssl_renew() {
    log "Renewing SSL certificates..."
    $COMPOSE run --rm certbot renew
    $COMPOSE exec nginx nginx -s reload
    log "SSL renewal complete!"
}

# ─── Add Custom Domain ───────────────────────────────────────
domain_add() {
    DOMAIN="${1:?Usage: deploy.sh domain-add <domain>}"
    UPSTREAM_PORT="${2:-3000}"

    log "Adding domain: $DOMAIN"

    # Generate Nginx config
    CONFIG_FILE="$DOMAINS_DIR/$DOMAIN.conf"
    cat > "$CONFIG_FILE" << EOF
# Auto-generated config for $DOMAIN
# Created: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Get SSL cert
    log "Obtaining SSL certificate for $DOMAIN..."
    $COMPOSE run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@afrostore.com \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN || warn "SSL cert failed — domain may not be pointing to this server yet"

    # Reload nginx
    $COMPOSE exec nginx nginx -s reload 2>/dev/null || warn "Nginx reload failed — may need restart"

    log "Domain $DOMAIN added!"
}

# ─── Remove Custom Domain ────────────────────────────────────
domain_remove() {
    DOMAIN="${1:?Usage: deploy.sh domain-remove <domain>}"

    log "Removing domain: $DOMAIN"

    CONFIG_FILE="$DOMAINS_DIR/$DOMAIN.conf"
    if [ -f "$CONFIG_FILE" ]; then
        rm "$CONFIG_FILE"
        $COMPOSE exec nginx nginx -s reload 2>/dev/null || true
        log "Domain $DOMAIN removed!"
    else
        warn "No config found for $DOMAIN"
    fi
}

# ─── Cron Setup ───────────────────────────────────────────────
setup_cron() {
    log "Setting up SSL renewal cron..."

    CRON_CMD="0 3 * * * cd $APP_DIR && $COMPOSE run --rm certbot renew && $COMPOSE exec nginx nginx -s reload"

    (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -

    log "Cron job added — SSL will auto-renew daily at 3 AM"
}

# ─── Main ─────────────────────────────────────────────────────
case "${1:-deploy}" in
    setup)          setup ;;
    deploy)         deploy ;;
    ssl-init)       ssl_init "$2" ;;
    ssl-renew)      ssl_renew ;;
    domain-add)     domain_add "$2" "$3" ;;
    domain-remove)  domain_remove "$2" ;;
    setup-cron)     setup_cron ;;
    *)
        echo "Usage: $0 {setup|deploy|ssl-init|ssl-renew|domain-add|domain-remove|setup-cron}"
        echo ""
        echo "Commands:"
        echo "  setup          — Initial setup (creates dirs, .env template)"
        echo "  deploy         — Build and deploy the app"
        echo "  ssl-init <d>   — Get initial SSL cert for primary domain"
        echo "  ssl-renew      — Renew all SSL certificates"
        echo "  domain-add <d> — Add a custom domain with SSL"
        echo "  domain-remove  — Remove a custom domain"
        echo "  setup-cron     — Set up auto SSL renewal cron job"
        exit 1
        ;;
esac

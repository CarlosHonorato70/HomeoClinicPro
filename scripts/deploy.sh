#!/usr/bin/env bash
# HomeoClinic Pro — Deploy/update script
# Usage: bash scripts/deploy.sh [--seed] [--force-rebuild]
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/homeoclinic/app}"
COMPOSE_FILES="-f $APP_DIR/docker-compose.yml -f $APP_DIR/docker-compose.prod.yml"
HEALTH_URL="http://localhost:3000/api/health"
SEED=false
FORCE_REBUILD=false

# Parse flags
for arg in "$@"; do
  case $arg in
    --seed) SEED=true ;;
    --force-rebuild) FORCE_REBUILD=true ;;
    *) echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

echo "============================================"
echo "  HomeoClinic Pro — Deploy"
echo "  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "============================================"

# -------------------------------------------------------------------
# 1. Pull latest code
# -------------------------------------------------------------------
echo ""
echo "[1/6] Pulling latest code..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/main 2>/dev/null || git reset --hard origin/master

# -------------------------------------------------------------------
# 2. Build Docker images
# -------------------------------------------------------------------
echo ""
echo "[2/6] Building Docker images..."
BUILD_ARGS=""
if [ "$FORCE_REBUILD" = true ]; then
  BUILD_ARGS="--no-cache"
fi
docker compose $COMPOSE_FILES build $BUILD_ARGS

# -------------------------------------------------------------------
# 3. Start/restart services
# -------------------------------------------------------------------
echo ""
echo "[3/6] Starting services..."
docker compose $COMPOSE_FILES up -d

# Wait for DB to be healthy
echo "  Waiting for database..."
for i in $(seq 1 30); do
  if docker compose $COMPOSE_FILES exec -T db pg_isready -U postgres &>/dev/null; then
    echo "  Database ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ERROR: Database did not become ready in 30s"
    docker compose $COMPOSE_FILES logs db
    exit 1
  fi
  sleep 1
done

# -------------------------------------------------------------------
# 4. Run Prisma migrations
# -------------------------------------------------------------------
echo ""
echo "[4/6] Running database migrations..."
docker compose $COMPOSE_FILES exec -T app npx prisma migrate deploy 2>&1 || {
  echo "  WARNING: prisma migrate deploy failed. Trying via builder..."
  docker compose $COMPOSE_FILES --profile seed run --rm seeder npx prisma migrate deploy
}

# -------------------------------------------------------------------
# 5. Seed data (optional)
# -------------------------------------------------------------------
if [ "$SEED" = true ]; then
  echo ""
  echo "[5/6] Seeding data..."
  bash "$APP_DIR/scripts/seed-production.sh"
else
  echo ""
  echo "[5/6] Skipping seed (use --seed for first deploy)"
fi

# -------------------------------------------------------------------
# 6. Health check
# -------------------------------------------------------------------
echo ""
echo "[6/6] Health check..."
HEALTHY=false
for i in $(seq 1 60); do
  STATUS=$(curl -sf "$HEALTH_URL" 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 || echo "")
  if [ -n "$STATUS" ]; then
    echo "  $STATUS"
    HEALTHY=true
    break
  fi
  if [ "$((i % 10))" -eq 0 ]; then
    echo "  Waiting... (${i}s)"
  fi
  sleep 1
done

if [ "$HEALTHY" = false ]; then
  echo "  WARNING: Health check failed after 60s"
  echo "  Checking logs..."
  docker compose $COMPOSE_FILES logs --tail 20 app
  exit 1
fi

# -------------------------------------------------------------------
# Cleanup
# -------------------------------------------------------------------
echo ""
echo "Cleaning up old Docker images..."
docker system prune -f --filter "until=72h" 2>/dev/null || true

# -------------------------------------------------------------------
# Status
# -------------------------------------------------------------------
echo ""
echo "============================================"
echo "  Deploy Complete!"
echo "============================================"
echo ""
docker compose $COMPOSE_FILES ps
echo ""
echo "Disk usage:"
df -h / | tail -1
echo ""
echo "Memory:"
free -h | head -2

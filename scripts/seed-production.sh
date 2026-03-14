#!/usr/bin/env bash
# HomeoClinic Pro — Production data seeding
# Usage: bash scripts/seed-production.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/homeoclinic/app}"
DATA_DIR="${DATA_DIR:-/opt/homeoclinic/data}"
COMPOSE_FILES="-f $APP_DIR/docker-compose.yml -f $APP_DIR/docker-compose.prod.yml"

echo "============================================"
echo "  HomeoClinic Pro — Data Seeding"
echo "============================================"

# -------------------------------------------------------------------
# 1. Check prerequisites
# -------------------------------------------------------------------
echo ""
echo "Checking data files..."

# Create data/extracted symlink if it doesn't exist
EXTRACTED_DIR="$APP_DIR/data/extracted"
if [ ! -d "$EXTRACTED_DIR" ] && [ -d "$DATA_DIR" ]; then
  mkdir -p "$APP_DIR/data"
  ln -sf "$DATA_DIR" "$EXTRACTED_DIR"
  echo "  Linked $DATA_DIR -> $EXTRACTED_DIR"
fi

HAS_REPERTORY=false
HAS_CORRELATOS=false

if [ -f "$DATA_DIR/repertory.json" ]; then
  HAS_REPERTORY=true
  echo "  repertory.json found ($(du -h "$DATA_DIR/repertory.json" | cut -f1))"
else
  echo "  WARNING: repertory.json not found in $DATA_DIR"
  echo "  Upload it with: scp repertory.json root@SERVER:$DATA_DIR/"
fi

if [ -f "$DATA_DIR/correlatos.json" ]; then
  HAS_CORRELATOS=true
  echo "  correlatos.json found"
else
  echo "  WARNING: correlatos.json not found in $DATA_DIR"
fi

# -------------------------------------------------------------------
# 2. Base seed (clinic, admin, demo patients)
# -------------------------------------------------------------------
echo ""
echo "[1/4] Seeding base data (clinic + admin user)..."
docker compose $COMPOSE_FILES --profile seed run --rm \
  -v "$DATA_DIR:/app/data/extracted" \
  seeder npx tsx prisma/seed.mts

echo "  Base data seeded."
echo "  Default login: admin@homeoclinic.com / admin123"

# -------------------------------------------------------------------
# 3. Repertory (188K rubrics)
# -------------------------------------------------------------------
if [ "$HAS_REPERTORY" = true ]; then
  echo ""
  echo "[2/4] Seeding repertory (188K rubrics — this takes ~10-15 minutes)..."
  docker compose $COMPOSE_FILES --profile seed run --rm \
    -v "$DATA_DIR:/app/data/extracted" \
    seeder npx tsx prisma/seed-repertory.mts
  echo "  Repertory seeded."
else
  echo ""
  echo "[2/4] SKIPPED: repertory.json not available"
fi

# -------------------------------------------------------------------
# 4. Correlatos
# -------------------------------------------------------------------
if [ "$HAS_CORRELATOS" = true ]; then
  echo ""
  echo "[3/4] Seeding correlatos..."
  docker compose $COMPOSE_FILES --profile seed run --rm \
    -v "$DATA_DIR:/app/data/extracted" \
    seeder npx tsx prisma/seed-correlatos.mts
  echo "  Correlatos seeded."
else
  echo ""
  echo "[3/4] SKIPPED: correlatos.json not available"
fi

# -------------------------------------------------------------------
# 5. Materia Medica (optional)
# -------------------------------------------------------------------
if [ -d "$DATA_DIR/textos" ]; then
  echo ""
  echo "[4/4] Seeding materia medica..."
  docker compose $COMPOSE_FILES --profile seed run --rm \
    -v "$DATA_DIR:/app/data/extracted" \
    -e TEXTOS_DIR="/app/data/extracted/textos" \
    seeder npx tsx prisma/seed-materia-medica.mts
  echo "  Materia medica seeded."
else
  echo ""
  echo "[4/4] SKIPPED: textos/ directory not available"
  echo "  Upload with: scp -r TEXTOS/ root@SERVER:$DATA_DIR/textos/"
fi

echo ""
echo "============================================"
echo "  Seeding Complete!"
echo "============================================"

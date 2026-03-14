#!/usr/bin/env bash
# HomeoClinic Pro — Database backup script
# Cron: 0 3 * * * /opt/homeoclinic/app/scripts/backup.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/homeoclinic/app}"
BACKUP_DIR="${BACKUP_DIR:-/opt/homeoclinic/backups}"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/homeoclinic_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Run pg_dump inside the Docker container
docker compose -f "$APP_DIR/docker-compose.yml" \
  exec -T db pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-homeoclinic}" \
  | gzip > "$BACKUP_FILE"

# Verify backup file is not empty (min 1KB)
FILESIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)
if [ "$FILESIZE" -lt 1024 ]; then
  echo "[$(date)] ERROR: Backup file too small (${FILESIZE} bytes). Backup may have failed."
  rm -f "$BACKUP_FILE"
  exit 1
fi

echo "[$(date)] Backup saved: $BACKUP_FILE ($(numfmt --to=iec "$FILESIZE" 2>/dev/null || echo "${FILESIZE} bytes"))"

# Cleanup old backups
DELETED=$(find "$BACKUP_DIR" -name "homeoclinic_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] Cleaned up $DELETED old backup(s)"
fi

echo "[$(date)] Backup complete."

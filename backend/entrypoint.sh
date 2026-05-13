#!/bin/sh
set -e

echo "[entrypoint] Running Alembic migrations..."
alembic upgrade head

echo "[entrypoint] Seeding initial data..."
python - <<'EOF'
from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.seed import seed
db = SessionLocal()
try:
    seed(db)
finally:
    db.close()
EOF

echo "[entrypoint] Starting uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2

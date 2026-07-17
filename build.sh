#!/usr/bin/env bash
# =============================================================================
# Render Build Script — Animal Bite Clinic System
# =============================================================================
# This script is executed by Render during the build phase.
#
# It assumes:
#   - The Django project lives under `backend/`
#   - `manage.py` is at `backend/manage.py`
#   - `requirements.txt` is at `backend/requirements.txt`
# =============================================================================

set -o errexit  # Exit on any error

echo "========================================"
echo "  Installing Python dependencies..."
echo "========================================"
pip install -r backend/requirements.txt

echo ""
echo "========================================"
echo "  Running database migrations..."
echo "========================================"
cd backend
python manage.py migrate --noinput

echo ""
echo "========================================"
echo "  Collecting static files..."
echo "========================================"
python manage.py collectstatic --noinput

echo ""
echo "========================================"
echo "  Build complete!"
echo "========================================"

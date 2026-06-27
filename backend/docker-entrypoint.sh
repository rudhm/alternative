#!/bin/sh
set -e

echo "Deploying database migrations..."
npx prisma migrate deploy

echo "Running folder migrations..."
node migrate-folders.js || echo "Migration script failed or not needed."

echo "Starting server..."
exec npm run start

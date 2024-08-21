#!/bin/sh

# Wait for the database to be ready
until pg_isready --host=trans-database --port=5432 --username=transcendancingqueens; do
  echo "Waiting for the database to be ready..."
  sleep 2
done

# echo "Database is ready. Running migrations..."

# create a new migration file in the prisma/migrations directory.
# only when creating new database volume or when schema.prisma file is changed
npx prisma migrate dev --name init

# Run migrations
npx prisma migrate deploy

# Check if migrations were successful
if [ $? -eq 0 ]; then
  echo "Migrations applied successfully. Starting the application..."
  # Start the application
  npm run start:prod
else
  echo "Migrations failed. Exiting..."
  exit 1
fi
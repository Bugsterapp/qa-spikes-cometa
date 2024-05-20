#!/bin/bash

# Load environment variables from .env file
if [ -f ./apps/guardian_frontend/.env ]; then
  ENV_FILE=./apps/guardian_frontend/.env
else
  ENV_FILE=./apps/guardian_frontend/.env.local
fi

# Load environment variables from .env or .env.local file
set -o allexport
source $ENV_FILE
set +o allexport

url="${NEXT_PUBLIC_CLIENT_API_BASE_URL}/api/schema/?format=json"

echo "Generating API client from $url"

# Run the command with the environment variable
npx swagger-typescript-api -p "$url" -o ./packages/trpc/src -n types.ts -t ./packages/trpc/src/templates
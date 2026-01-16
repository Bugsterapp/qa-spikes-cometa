#!/bin/bash

if [[ $CI == 'true' ]]; then
  echo "Skipping in CI environment"
  exit 0
fi

# Load environment variables from .env file
if [[ $APP == 'dashboard' ]]; then
  echo "Generating API client from dashboard config"
  ENV_FILE=./apps/dashboard/.env.local
else
  echo "Generating API client from portal config"
  ENV_FILE=./apps/guardian_frontend/.env.local
fi

if [[ $VERCEL != '1' ]]; then
  # Load environment variables from .env or .env.local file
  echo "Using local environment variables"
  set -o allexport
  source $ENV_FILE
  set +o allexport
else
  echo "Using Vercel environment variables"
fi

generate_client() {
  local url=$1
  local output=$2
  local name=$3
  echo "Generating API client from $url"
  npx --yes swagger-typescript-api@13.0.16 -p "$url" -o "$output" -n "$name" -t ./packages/trpc/src/templates
}

# Pre-install the package once to avoid race conditions when running parallel jobs
echo "Pre-installing swagger-typescript-api..."
npx --yes swagger-typescript-api@13.0.16 --version

url="${NEXT_PUBLIC_CLIENT_API_BASE_URL}/api/schema/?format=json"
generate_client "$url" "./packages/trpc/src" "types.ts" &

# Generate Students API client if URL is set
if [[ -n "$NEXT_PUBLIC_SCHOOLS_URL" ]]; then
  students_url="${NEXT_PUBLIC_SCHOOLS_URL}/openapi.json"
  generate_client "$students_url" "./packages/trpc/src" "students/types.ts" &
else
  echo "NEXT_PUBLIC_SCHOOLS_URL is not set or is empty. Skipping API client generation for students_url."
fi

# Generate Admissions API client if URL is set
if [[ -n "$NEXT_PUBLIC_ADMISSIONS_URL" ]]; then
  admissions_url="${NEXT_PUBLIC_ADMISSIONS_URL}/openapi.json"
  generate_client "$admissions_url" "./packages/trpc/src" "admissions/types.ts" &
else
  echo "NEXT_PUBLIC_ADMISSIONS_URL is not set or is empty. Skipping API client generation for admissions_url."
fi

# Generate Auth API client if URL is set
if [[ -n "$NEXT_PUBLIC_AUTH_URL" ]]; then
  auth_url="${NEXT_PUBLIC_AUTH_URL}/api/v1/openapi.json"
  generate_client "$auth_url" "./packages/trpc/src" "auth/types.ts" &
else
  echo "NEXT_PUBLIC_AUTH_URL is not set or is empty. Skipping API client generation for auth_url."
fi

# Generate concepts API client if URL is set
if [[ -n "$NEXT_PUBLIC_CONCEPTS_URL" ]]; then
  concepts_url="${NEXT_PUBLIC_CONCEPTS_URL}/openapi.json"
  generate_client "$concepts_url" "./packages/trpc/src" "concepts/types.ts" &
else
  echo "NEXT_PUBLIC_CONCEPTS_URL is not set or is empty. Skipping API client generation for concepts_url."
fi

# Generate bot API client if URL is set
if [[ -n "$NEXT_PUBLIC_BOT_URL" ]]; then
  bot_url="${NEXT_PUBLIC_BOT_URL}/openapi.json"
  generate_client "$bot_url" "./packages/trpc/src" "bot/types.ts" &
else
  echo "NEXT_PUBLIC_BOT_URL is not set or is empty. Skipping API client generation for bot_url."
fi

# Generate integrations API client if URL is set
if [[ -n "$NEXT_PUBLIC_INTEGRATIONS_URL" ]]; then
  integrations_url="${NEXT_PUBLIC_INTEGRATIONS_URL}/openapi.json"
  generate_client "$integrations_url" "./packages/trpc/src" "integrations/types.ts" &
else
  echo "NEXT_PUBLIC_INTEGRATIONS_URL is not set or is empty. Skipping API client generation for integrations_url."
fi

# Generate Cometa API client if URL is set
if [[ -n "$NEXT_PUBLIC_COMETA_URL" ]]; then
  cometa_url="${NEXT_PUBLIC_COMETA_URL}/openapi.json"
  generate_client "$cometa_url" "./packages/trpc/src" "cometa/types.ts" &
else
  echo "NEXT_PUBLIC_COMETA_URL is not set or is empty. Skipping API client generation for cometa_url."
fi

wait

# Generate Announcements API client if URL is set
if [[ -n "$NEXT_PUBLIC_COMETARDO_API_BASE_URL" ]]; then
  announcements_url="${NEXT_PUBLIC_COMETARDO_API_BASE_URL}/openapi.json"
  generate_client "$announcements_url" "./packages/trpc/src" "announcements/types.ts" &
else
  echo "NEXT_PUBLIC_COMETARDO_API_BASE_URL is not set or is empty. Skipping API client generation for announcements_url."
fi

wait

echo "All API clients have been generated."

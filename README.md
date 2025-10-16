# szamlazzponthu-test-FE

# Indítás
npm run start

# Generate api
openapi-generator-cli generate -i src/assets/api.yaml -g typescript-fetch -o src/app/core/services/api

# FIX generated api errors
node scripts/patch-openapi-runtime.cjs
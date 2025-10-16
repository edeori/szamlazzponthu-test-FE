#!/bin/sh
set -eu

# Alapértelmezés, ha nincs API_BASE_URL megadva
: "${API_BASE_URL:=https://api.sajatdomain.hu}"

TEMPLATE="/usr/share/nginx/html/assets/env.template.js"
TARGET="/usr/share/nginx/html/assets/env.js"

# Töltsük fel a helyettesített fájlt
envsubst '${API_BASE_URL}' < "$TEMPLATE" > "$TARGET"

# hagyjuk az official nginx entrypoint-ot futni (a /docker-entrypoint.d alatt vagyunk)
exit 0

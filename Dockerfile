# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

# A projekt almappája
ARG APP_DIR=szamlazzponthu-test-ui-app

# Csak a csomagfájlokat, hogy a cache működjön
COPY ${APP_DIR}/package*.json ./
RUN npm ci

# Teljes app
COPY ${APP_DIR}/ ./
RUN npm run build

# ---- runtime ----
FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

# Nginx conf
COPY scripts/nginx.conf /etc/nginx/conf.d/default.conf

# Statikus build kimenet (Angular 19 application builder)
COPY --from=build /app/dist/szamlazzponthu-test-ui-app/browser /usr/share/nginx/html

# assets az env.js-nek
RUN mkdir -p /usr/share/nginx/html/assets

# Runtime env sablon + entrypoint hook
COPY scripts/env.template.js /usr/share/nginx/html/assets/env.template.js
COPY scripts/docker-entrypoint.sh /docker-entrypoint.d/99-envsubst.sh
RUN chmod +x /docker-entrypoint.d/99-envsubst.sh

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ > /dev/null || exit 1

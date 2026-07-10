# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite app ----
# VITE_* variables are inlined into the bundle at BUILD time, so the target API URLs and base path
# must be known here. Defaults target the local docker-compose (the browser reaches the backends on
# the host's published ports). Override with --build-arg for another environment (e.g. Railway).
FROM node:22-bookworm-slim AS build
WORKDIR /app

ARG VITE_BASE_PATH=/
ARG VITE_AUTH_API_HOST=http://localhost:3000
ARG VITE_AUTH_API_PATH=/api
ARG VITE_CV_API_HOST=http://localhost:3001
ARG VITE_CV_API_PATH=/api

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Write an .env so BOTH vite.config.js (which resolves `base` via loadEnv, reading .env files) and
# the app code (import.meta.env.VITE_*) build against the same values, then produce dist/.
RUN printf 'VITE_BASE_PATH=%s\nVITE_AUTH_API_HOST=%s\nVITE_AUTH_API_PATH=%s\nVITE_CV_API_HOST=%s\nVITE_CV_API_PATH=%s\n' \
		"$VITE_BASE_PATH" "$VITE_AUTH_API_HOST" "$VITE_AUTH_API_PATH" "$VITE_CV_API_HOST" "$VITE_CV_API_PATH" > .env \
	&& npm run build

# ---- Serve stage: static bundle behind nginx ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# nginx runs in the foreground via the base image's default CMD.

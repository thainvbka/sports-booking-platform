# ============================================
# STAGE 1: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY apps/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY apps/frontend ./

# Build arguments passed by CI/CD
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Set environment variables for build time compilation
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Compile frontend app
RUN npm run build

# ============================================
# STAGE 2: Production Runner (Nginx)
# ============================================
FROM nginx:alpine AS runner

# Note: nginx.conf is NOT baked into the image.
# In production, it is mounted as a volume via docker-compose.prod.yml
# to allow hot-reload without rebuilding the image.

# Copy static compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 80

# Nginx status health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

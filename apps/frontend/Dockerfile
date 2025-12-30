# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files từ monorepo
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Cài đặt dependencies
RUN npm ci

# ============================================
# STAGE 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

# Copy source code
COPY apps/frontend ./apps/frontend
COPY package.json package-lock.json* ./

# Build arguments cho environment variables
ARG VITE_API_URL

# Set environment variables cho build
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# ============================================
# STAGE 3: Production Runner với Nginx
# ============================================
FROM nginx:alpine AS runner

# Copy nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files từ builder
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Tạo non-root user
RUN addgroup --system --gid 1001 nginx-user && \
    adduser --system --uid 1001 nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

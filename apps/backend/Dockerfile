# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

# Cài đặt các dependencies cần thiết cho native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files từ monorepo
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/db/package.json ./packages/db/
COPY packages/validation/package.json ./packages/validation/

# Cài đặt tất cả dependencies (bao gồm devDependencies để build)
RUN npm ci

# ============================================
# STAGE 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY apps/backend ./apps/backend
COPY package.json package-lock.json* ./

# Generate Prisma Client
WORKDIR /app/packages/db
RUN npx prisma generate

# Build TypeScript
WORKDIR /app/apps/backend
RUN npm run build

# ============================================
# STAGE 3: Production Runner
# ============================================
FROM node:22-alpine AS runner

# Cài đặt dumb-init để xử lý signals đúng cách
RUN apk add --no-cache dumb-init

WORKDIR /app

# Tạo user non-root để chạy app (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy chỉ production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy built code từ builder stage
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages ./packages

# Copy package.json files (cần cho runtime)
COPY apps/backend/package.json ./apps/backend/
COPY package.json ./

# Chuyển ownership cho nodejs user
RUN chown -R nodejs:nodejs /app

# Switch sang non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Sử dụng dumb-init để xử lý signals
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "apps/backend/dist/server.js"]

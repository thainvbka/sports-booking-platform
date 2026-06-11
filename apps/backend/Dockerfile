# ============================================
# STAGE 1: Builder
# ============================================
FROM node:22-alpine AS builder

# Install build dependencies for native modules (like bcrypt) and Prisma
RUN apk add --no-cache libc6-compat python3 make g++ openssl

WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./

# Install dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy Prisma schema
COPY apps/backend/prisma ./prisma

# Generate Prisma Client (builds with local binary targets)
RUN npx prisma generate

# Copy all source files
COPY apps/backend/ ./

# Build TypeScript to Javascript
RUN npm run build

# Prune devDependencies to keep the runner image lightweight
RUN npm prune --omit=dev

# Re-generate Prisma Client to ensure it exists in pruned node_modules
RUN npx prisma generate

# ============================================
# STAGE 2: Runner
# ============================================
FROM node:22-alpine AS runner

# Install runtime dependencies (openssl for Prisma, dumb-init for process control)
RUN apk add --no-cache openssl dumb-init

WORKDIR /app

# Copy runtime dependencies and build artifacts from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose backend service port
EXPOSE 3000

# Run as non-root user 'node' for security compliance
RUN chown -R node:node /app
USER node

# Health check endpoint verification
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

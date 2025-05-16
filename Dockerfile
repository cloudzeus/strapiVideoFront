# Base stage for dependencies
FROM node:20.11-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Debug: Show system info
RUN uname -a && \
    node --version && \
    npm --version && \
    apk info

# Copy package files
COPY package.json package-lock.json* ./

# Debug: Show package files
RUN ls -la && \
    cat package.json

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --verbose --legacy-peer-deps

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", ".next/standalone/server.js"] 
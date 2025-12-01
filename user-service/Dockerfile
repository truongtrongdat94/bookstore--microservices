# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Copy templates to dist folder
RUN mkdir -p ./dist/templates && cp -r ./src/templates/* ./dist/templates/

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install wget for health checks (alpine compatible)
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from builder stage (including templates)
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check using wget instead of curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/server.js"]

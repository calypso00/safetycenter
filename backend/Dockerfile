# Backend Dockerfile
FROM node:18-alpine

# Install tini for proper signal handling (PID 1 problem solution)
RUN apk add --no-cache tini

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files with proper ownership
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies
# --omit=dev excludes devDependencies
# npm cache clean reduces image size
RUN npm install --omit=dev && npm cache clean --force

# Copy source code with proper ownership
COPY --chown=nodejs:nodejs src/ ./src/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use tini as entrypoint for proper signal handling
# This ensures SIGTERM is properly forwarded to Node.js process
ENTRYPOINT ["/sbin/tini", "--"]

# Start server
CMD ["node", "src/server.js"]

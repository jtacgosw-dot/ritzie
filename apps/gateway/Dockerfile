FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./

# Copy all package.json files for workspace resolution
COPY packages/types/package.json ./packages/types/
COPY packages/embed/package.json ./packages/embed/
COPY packages/sdk/package.json ./packages/sdk/
COPY apps/gateway/package.json ./apps/gateway/

# Install all workspace dependencies
RUN pnpm install

# Copy source code for all packages
COPY packages/ ./packages/
COPY apps/gateway/ ./apps/gateway/

# Build the gateway application
WORKDIR /app/apps/gateway
RUN pnpm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]

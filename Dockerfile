# Use a specific Node.js version as a base image builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code and build it
COPY . .
RUN npm run build

# Create runner stage for the production image
FROM node:20-alpine AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy the built standalone server output from builder stage
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 3000

# Start the application using Nitro production server
CMD ["node", ".output/server/index.mjs"]

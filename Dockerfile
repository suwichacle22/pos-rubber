# ---------- Build stage ----------
    FROM oven/bun:latest AS builder
    WORKDIR /app
    
    COPY package.json bun.lock ./
    RUN bun install --frozen-lockfile
    
    COPY . .
    RUN bun run build
    
    # ---------- Runtime stage ----------
    FROM oven/bun:latest
    WORKDIR /app
    
    COPY --from=builder /app/.output ./.output
    COPY --from=builder /app/package.json ./
    
    EXPOSE 3000
    CMD ["bun", "run", "start"]
# ---------- Build stage ----------
FROM oven/bun:1.3.0 AS builder
WORKDIR /app

ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bun run build

# ---------- Runtime stage ----------
FROM oven/bun:1.3.0
WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["bun", "run", "start"]
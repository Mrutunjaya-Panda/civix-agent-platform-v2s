# ── Stage 1: Build Vite frontend ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app/client

# Install deps first (layer cache for npm install)
COPY client/package*.json ./
RUN npm install

# Copy source and build
COPY client/ ./
RUN cp env-prod.txt ../.env.production
RUN npm run build
# Output: /app/client/dist/

# ── Stage 2: Production server ────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install server production deps only
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=builder /app/client/dist ./client/dist

# Cloud Run requires PORT=8080
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server/server.js"]

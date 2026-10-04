# # ── Stage 1: Build Vite frontend ───────────────────────────────────────────────
# FROM node:20-alpine AS builder
# WORKDIR /app/client

# # Install deps first (layer cache for npm install)
# COPY client/package*.json ./
# RUN npm install

# # Copy source and build
# COPY client/ ./
#  RUN cp env-prod-upload.txt ../.env.production
# RUN npm run build
# # Output: /app/client/dist/

# # ── Stage 2: Production server ────────────────────────────────────────────────
# FROM node:20-alpine
# WORKDIR /app

# # Install server production deps only
# COPY server/package*.json ./server/
# RUN cd server && npm install --omit=dev

# # Copy server source
# COPY server/ ./server/

# # Copy built frontend from Stage 1
# COPY --from=builder /app/client/dist ./client/dist

# # Cloud Run requires PORT=8080
# EXPOSE 8080
# ENV PORT=8080
# ENV NODE_ENV=production

# CMD ["node", "server/server.js"]


# render deployment
# ── Stage 1: Build Vite frontend ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app/client

# Install deps first (layer cache for npm install)
COPY client/package*.json ./
RUN npm install

# Copy source
COPY client/ ./

# Render environment variables are passed to Docker as build arguments.
# These are client-side/public variables used by Vite.
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_MUNICIPAL_WORKER_PASSPHRASE
ARG VITE_CARTO_BASEMAP_KEY

# Make the variables available to Vite during the build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME \
    VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET \
    VITE_MUNICIPAL_WORKER_PASSPHRASE=$VITE_MUNICIPAL_WORKER_PASSPHRASE \
    VITE_CARTO_BASEMAP_KEY=$VITE_CARTO_BASEMAP_KEY

# Build frontend
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
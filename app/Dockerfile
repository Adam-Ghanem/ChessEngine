FROM node:22-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install -g corepack@latest \
    && corepack pnpm install --no-frozen-lockfile \
    && corepack pnpm run build:engine \
    && corepack pnpm run build

ENV NODE_ENV=production \
    CHESSIQ_ENGINE_PATH=/app/engine/bin/ChessEngine
CMD ["node", "dist/index.js"]

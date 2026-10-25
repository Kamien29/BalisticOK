FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY public public
COPY src src
RUN npm run build
FROM node:22-alpine
WORKDIR /app
ENV PORT=3000 DATA_DIR=/app/data NODE_ENV=production
COPY --from=builder /app/build build
COPY server server
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node","server/index.js"]

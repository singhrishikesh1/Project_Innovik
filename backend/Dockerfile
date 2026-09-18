FROM node:20-alpine AS builder
WORKDIR /app
COPY shared ./shared
COPY backend ./backend
WORKDIR /app/backend
RUN npm install
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/backend
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/dist ./dist
RUN npm install --omit=dev
EXPOSE 5001
CMD ["node", "dist/server.js"]



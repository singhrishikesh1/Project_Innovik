FROM node:20-alpine AS builder
WORKDIR /app
COPY shared ./shared
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

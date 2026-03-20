# Stage 1: build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time env variables (вшиваются в бандл Vite)
ARG VITE_APP_BASE_URL
ARG WS_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL
ENV WS_BASE_URL=$WS_BASE_URL

RUN npm run build-only

# Stage 2: serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

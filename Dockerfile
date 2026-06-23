FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências primeiro
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código e build
COPY . .

# Variáveis de build — Railway injeta via environment
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Servir com nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx para SPA (redireciona tudo para index.html)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json \
               application/javascript text/xml \
               application/xml application/xml+rss text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

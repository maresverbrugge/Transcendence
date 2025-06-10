# FRONTEND DOCKERFILE

FROM node:22-alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/ssl/private /etc/ssl/certs && \
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/selfsigned.key \
    -out /etc/ssl/certs/selfsigned.crt \
    -subj "/CN=localhost"

COPY ./ /app/

WORKDIR /app

RUN npm install

RUN npm install -g serve

RUN npm run build

CMD ["serve", "-s", "build", "-l", "3000", "--ssl-cert", "/etc/ssl/certs/selfsigned.crt", "--ssl-key", "/etc/ssl/private/selfsigned.key"]

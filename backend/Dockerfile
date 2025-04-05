# BACKEND DOCKERFILE

FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apk --no-cache add postgresql-client

COPY . .

RUN npx prisma generate

RUN npm run build

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# FRONTEND DOCKERFILE

FROM node:22-alpine

COPY ./ /app/

WORKDIR /app

RUN npm install

RUN npm install -g serve

RUN npm run build

CMD ["serve", "-s", "build", "-l", "3000"]

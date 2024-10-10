# backend/Dockerfile

# Base image is lightweight version of Node.js
FROM node:16-alpine

# Set working directory
# All commands will be executed in this directory
WORKDIR /app

# Copy package.json from host machine to container working directory
# Install dependencies specified in package.json
COPY package*.json ./
RUN npm install

# Install PostgreSQL client tools
RUN apk --no-cache add postgresql-client

# Copy the source code from host machine to container
COPY . .

# Run database migration and generate Prisma client
RUN npx prisma generate

# Build the NestJS backend application
RUN npm run build

# Expose the application port
# This is the port where NestJS application will listen for incoming requests
EXPOSE 3001

# Copy and set permissions for the entry point script
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Specify the entry point
ENTRYPOINT ["/entrypoint.sh"]

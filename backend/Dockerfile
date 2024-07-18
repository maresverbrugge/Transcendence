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

# Copy the source code from host machine to container
COPY . .

# Build the NestJS backend application
RUN npm run build

# Expose the application port
# This is the port where NestJS application will listen for incoming requests
EXPOSE 3000

# Start the NestJS application in production mode
CMD ["npm", "run", "start:prod"]

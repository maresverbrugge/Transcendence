# frontend/Dockerfile

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

# Build the frontend application
# For React, this creates a production-ready build in the build directory
RUN npm run build

# Install the serve package globally to have a simple HTTP server to serve static files
RUN npm install -g serve

# Expose the application port 
# This is the port where the static files are served
EXPOSE 3000

# Start the application
# Runs the serve command to serve the static files from the build directory
CMD ["serve", "-s", "build"]

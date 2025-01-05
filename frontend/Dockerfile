# # Step 1: Build the React app using Node.js
# FROM node:16-alpine as build

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json first
# COPY package*.json ./

# RUN apt-get update && apt-get upgrade -y && apt-get install -y npm  

# # Install dependencies
# RUN npm install

# # Copy the rest of the source code
# COPY . .

# # Build the React app
# RUN npm run build

# # Step 2: Use Nginx to serve the static files
# FROM nginx:stable-alpine

# # Copy the built React app from the 'build' stage into Nginx's default directory
# COPY --from=build /app/build /usr/share/nginx/html

# # Expose the port Nginx will use to serve the app
# EXPOSE 1024

# # Start Nginx (default command for Nginx)
# CMD ["nginx", "-g", "daemon off;"]



FROM node:lts-alpine

COPY ./     /app/

WORKDIR /app

RUN npm install

RUN npm install -g serve

RUN npm run build

CMD ["serve", "-s", "build", "-l", "3000"]

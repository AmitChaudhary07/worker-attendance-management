# Base image for building the app
FROM node:22.12.0-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire app and build it
COPY . .
RUN npm run build

# Use a lightweight HTTP server to serve static files
FROM node:22.12.0-alpine

WORKDIR /app

# Install a lightweight server (e.g., `http-server`)
RUN npm install -g http-server

# Copy the build files from the previous stage
COPY --from=build /app/dist /app

# Expose the port
EXPOSE 8080

# Run the HTTP server
CMD ["http-server", "-p", "8080"]

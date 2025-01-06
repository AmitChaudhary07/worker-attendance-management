FROM node:22.12.0 AS build

# Initialize Working directory
WORKDIR dependancies/

# Copy the dependancy files
COPY package*.json /dependancies/

# Install dependancies
RUN npm install
RUN npm audit fix

# Stage 2
# Initialize base image
FROM node:22.12.0-slim

WORKDIR app/

COPY --from=build /dependancies/node_modules/ /app/node_modules/

# Copy rest of the project files
COPY . .

# Run the app in dev mode
ENTRYPOINT ["npm"]
CMD ["run","dev"]

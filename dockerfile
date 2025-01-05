FROM node:22.12.0

# Setup workdir
WORKDIR app/

# copy the dependancy files
COPY package.json /app/
COPY package-lock.json /app/

# run the build commands
RUN npm install
RUN npm audit fix

# Copy the rest of the files
COPY . .

# Run the app in dev environment
ENTRYPOINT ["npm"]
CMD ["run","dev"]
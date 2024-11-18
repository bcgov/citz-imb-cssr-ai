#############################################
#                 Base                      #
#############################################
# Use an official Node.js runtime as a base image
FROM node:22.9-bullseye-slim as base

# Set the working directory in the container
WORKDIR /server

# Copy files, excluding those in .dockerignore
COPY . .

# Install packages. Needed for build process.
RUN npm i

# Compile to JavaScript build 
RUN npm run build

#############################################
#                 Prod Build                #
#############################################
FROM node:22.9-bullseye-slim as Prod

# Set the working directory to /server
WORKDIR /server

# Install packages. Needed even for compiled build.
# Only installs non-dev dependencies
COPY package.json .
RUN npm i

# Add curl for health check
RUN apt-get update
RUN apt-get install -y curl

# Copy compiled build from base
COPY --from=base /server/dist .


CMD ["node", "index.js"]

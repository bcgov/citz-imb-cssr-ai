#############################################
#                 Base                      #
#############################################
# Use an official Node.js runtime as a base image
FROM node:22.13.1-bullseye-slim AS base

# Set the working directory in the container
WORKDIR /server

# Copy package files
COPY package*.json ./

# Copy source code
COPY . .

# Install dependencies
RUN npm install

# Build TypeScript code
RUN npm run build

#############################################
#                 Prod Build                #
#############################################
FROM node:22.13.1-bullseye-slim AS prod

# Set the working directory to /server
WORKDIR /server

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install

# Add curl for health check
RUN apt-get update
RUN apt-get install -y curl

# Copy compiled build from base
COPY --from=base /server/dist .

# Start the server
CMD ["node", "src/index.js"]

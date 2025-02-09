#############################################
#                Base Build                 #
#############################################

FROM node:18.17.1-bullseye-slim AS base

# Set the working directory to /app
WORKDIR /app

# Copy all files needed for build
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./
COPY ./src ./src
COPY ./public ./public

# Install packages
RUN npm set progress=false
RUN npm ci

# Build the project
RUN npm run build

#############################################
#                NGINX Build                #
#############################################
## Stage 2: Nginx state for serving content
FROM nginx:alpine-slim AS prod

# copy custom nginx configuration from host to container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=base /app/dist .

# Provide nginx directory the required permissions
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx

# Run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]

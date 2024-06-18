# This file gives the instructions as commands from the user to call from the terminal to assemble an image

# Stage 0: install the base dependencies
FROM node:18.13.0 AS dependencies

# Defining environments variables
ENV NODE_ENV=production
ENV PORT=8080

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

#################################################################

# Stage 1: Build Stage
FROM node:18.13.0 AS build

# Image's metadata
LABEL maintainer="Henrique Sagara <hsagara@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Defining environments variables
# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

#####################################################################

# Stage 2: Run Stage
FROM node:18.13.0-alpine

# Copy built node_modules and source code from build stage
WORKDIR /app
COPY --from=build /app /app

# Run the server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
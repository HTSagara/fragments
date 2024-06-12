# This file gives the instructions as commands from the user to call from the terminal to assemble an image

# Specifies the parent imageas a starting point
# Adding a :tag specifies a particular version of the image
FROM node:18.13.0

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

# Run the server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
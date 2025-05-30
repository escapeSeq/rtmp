# Use an official Node.js image as the base image
FROM node:18-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies and generate package-lock.json
RUN npm install

# Clean install using npm ci
RUN npm ci --production

# Copy the rest of your application code
COPY . .

# Specify the command to run your application
CMD ["node", "index.js"]
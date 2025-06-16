# Use an official Node.js image as the base image
FROM node:18-slim

# Install ffmpeg and verify installation
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    ffmpeg -version

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Create media directory and set permissions
RUN mkdir -p media && \
    chmod -R 777 media

# Expose ports
EXPOSE 1935
EXPOSE 8080

# Specify the command to run your application
CMD ["node", "index.js"]
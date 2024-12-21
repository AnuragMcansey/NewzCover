# Base image
FROM node:18.18.0 AS base

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production=false

# Copy the rest of the application code
COPY . .

# Expose the backend port 
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

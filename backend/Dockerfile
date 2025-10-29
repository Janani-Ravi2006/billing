# Use Node.js official image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all project files
COPY . .

# Expose port 5000
EXPOSE 5000

# Start server
CMD ["npm", "start"]

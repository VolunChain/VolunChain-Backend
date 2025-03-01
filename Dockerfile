# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy npm configuration files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Generate the Prisma client (ensures it's ready to run migrations)
RUN npx prisma generate

# Expose port 3000 in the container
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]

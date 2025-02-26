# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy npm configuration files
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the rest of the source code into the container
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Expose port 3000 for the app
EXPOSE 3000

# Use a single command to start Prisma migrations and run the app
CMD ["sh", "-c", "npx prisma migrate dev && npm run dev"]

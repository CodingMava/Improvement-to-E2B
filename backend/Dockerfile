# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# NEW: Install OpenSSL and libc compatibility (Required for Prisma on Alpine)
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client and compile TypeScript to JavaScript
RUN npx prisma generate
RUN npm run build

# Expose the API port
EXPOSE 4000

# When the container starts, ensure the database is pushed, then start the server
CMD ["sh", "-c", "npx prisma db push && npm run start"]
# Development Dockerfile — used with docker-compose (hot-reload via volume mount)
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 5173

# Vite dev server — host 0.0.0.0 so it's reachable outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

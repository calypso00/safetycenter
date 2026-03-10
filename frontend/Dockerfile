# Frontend Dockerfile
# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates
COPY certs/cert.pem /etc/nginx/ssl/cert.pem
COPY certs/key.pem /etc/nginx/ssl/key.pem

# Set proper permissions for SSL certificates
RUN chmod 644 /etc/nginx/ssl/cert.pem && \
    chmod 600 /etc/nginx/ssl/key.pem

# Expose ports (HTTP and HTTPS)
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine

# Install PostgreSQL client (pg_dump) and MySQL client (mysqldump)
RUN apk update && \
    apk add --no-cache postgresql-client mysql-client tzdata

# Set working directory
WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create volume mount point for backups
VOLUME ["/usr/src/app/backups"]

# Expose the dashboard port
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]

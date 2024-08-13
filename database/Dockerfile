# Use the official PostgreSQL image
FROM postgres:latest

# Install PostgreSQL client tools
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*
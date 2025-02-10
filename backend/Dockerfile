FROM ubuntu:22.04

# Set Node.js version
ENV NODE_VERSION=20.x

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
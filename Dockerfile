FROM node:20-slim

# Install system dependencies: Python (for yt-dlp), ffmpeg, curl
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install yt-dlp --break-system-packages

WORKDIR /app

# Install root dependencies and build frontend
COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install

WORKDIR /app

EXPOSE 3001

CMD ["node", "server/index.js"]

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Create storage dirs
RUN mkdir -p uploads/edited models

EXPOSE 3001
CMD ["node", "server.js"]

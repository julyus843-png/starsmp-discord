FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install
COPY src ./src
CMD ["node", "--import", "tsx/esm", "src/index.ts"]

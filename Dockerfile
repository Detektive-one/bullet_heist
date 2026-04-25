FROM node:18

WORKDIR /app
COPY . .

RUN npm ci && npm run build

EXPOSE 5000
CMD ["npx", "serve", "www", "-l", "5000"]

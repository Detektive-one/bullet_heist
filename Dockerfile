FROM node:18

WORKDIR /app
COPY . .

RUN npm install -g serve

EXPOSE 5000
CMD ["serve", ".", "-l", "5000"]
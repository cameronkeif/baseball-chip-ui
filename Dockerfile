FROM node:19-alpine

WORKDIR /home/app

COPY ./src ./src
COPY ./public ./public
COPY ./tsconfig.json ./
COPY package*.json ./
RUN npm i

CMD ["npm", "start"]
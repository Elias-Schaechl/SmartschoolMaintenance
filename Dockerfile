FROM node:8
WORKDIR /usr/src/app
RUN npm install typescript
COPY package.json .
RUN npm install
COPY . .
CMD [ "node", "dist/service.js" ]

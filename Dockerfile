FROM node:8-jessie

WORKDIR /app

# install dependencies
COPY package.json ./

RUN npm cache clean --force && npm install

# copy source files to directory
COPY . .

EXPOSE 3000
CMD ["npm", "start"]

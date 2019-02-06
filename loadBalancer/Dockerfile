FROM node:11

WORKDIR /loadBalancer

COPY package.json .

RUN npm install && npm install nodemon -g

# COPY . .

CMD [ "nodemon", "balancer.js" ]
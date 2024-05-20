# build environment
FROM node:16-alpine as builder

RUN apk update && apk upgrade && apk add curl

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Install packages
COPY ./package*.json /usr/src/app/

# Use this version, in case of bad internet
# RUN yarn install --network-timeout 100000
RUN yarn install 

COPY . /usr/src/app
ENV NODE_ENV=production
RUN yarn run build


EXPOSE 3000

CMD ["yarn", "start"]
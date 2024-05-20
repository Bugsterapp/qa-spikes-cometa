FROM node:16-alpine

RUN apk update && apk upgrade

# create destination directory and set it as the working directory
RUN mkdir -p /code/
WORKDIR /code

# copy package.json and install required packages
COPY ./package*.json /code/
RUN yarn install --network-timeout 100000

# copy code
COPY ./ /code/

ENV PORT=3001
EXPOSE $PORT

CMD [ "yarn", "dev" ]

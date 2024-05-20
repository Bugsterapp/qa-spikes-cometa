FROM node:16-alpine

RUN apk update && apk upgrade

# create destination directory
RUN mkdir -p /code/
WORKDIR /code

# copy package.json and install required packages
COPY ./package*.json /code/
COPY ./yarn.lock /code/
RUN yarn install --frozen-lockfile --ignore-scripts \ 
		&& yarn cache clean

ENV PORT=3000
EXPOSE $PORT

CMD [ "yarn", "dev" ]

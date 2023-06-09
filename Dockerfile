FROM node:18-alpine

COPY . /home

WORKDIR /home

RUN apk add bash \
    && chown -R node:node /home \
    && yarn --immutable \
    && yarn build

EXPOSE 3000

USER node

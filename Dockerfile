FROM node:alpine

COPY . /home

WORKDIR /home

RUN apk add bash \
    && yarn --immutable \
    && yarn ci

EXPOSE 3000

USER node
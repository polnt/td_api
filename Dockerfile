FROM node:alpine

COPY . /home

WORKDIR /home

RUN apk add bash \
    && yarn \
    && yarn ci

USER node
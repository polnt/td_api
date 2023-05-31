FROM node:alpine

COPY . /home

WORKDIR /home

RUN apk add bash \
    && yarn \
    && yarn ci

EXPOSE 3000

USER node
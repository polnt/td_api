FROM node:alpine

COPY . /home

WORKDIR /home

RUN apk add bash \
    && yarn

EXPOSE 3000

USER node
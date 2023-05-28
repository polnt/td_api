FROM node:alpine

COPY . /home

WORKDIR /home

RUN apk add bash && \
  yarn install

EXPOSE 3000
FROM node:alpine

COPY . /home

WORKDIR /home

RUN apk add bash \
    && chown -R node:node /home \
    && yarn \
    && chmod +x /home/hack/run_tests.sh

USER node
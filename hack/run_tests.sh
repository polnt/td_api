#!/bin/bash

docker compose up --build --detach
yarn test:docker
yarn docker:reset
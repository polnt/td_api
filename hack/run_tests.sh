#!/bin/bash

# docker compose -f ./hack/docker-compose.dummy.yml up --attach api_test --build --abort-on-container-exit
# docker compose -f ./hack/docker-compose.dummy.yml down --volumes

docker compose -f ./hack/docker-compose.dummy.yml up -d --build
docker compose exec api_test bash -c 'yarn test:all'
# docker compose -f ./hack/docker-compose.dummy.yml down --volumes

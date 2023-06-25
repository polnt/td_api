#!/bin/bash

docker compose -f ./hack/docker-compose.ci.yml up -d --build
docker compose -f ./hack/docker-compose.ci.yml exec api_test bash -c 'yarn test:all'
# docker compose -f ./hack/docker-compose.ci.yml down --volumes

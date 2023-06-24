#!/bin/bash

docker compose -f ./hack/docker-compose.dummy.yml up --attach api_test --build --abort-on-container-exit
docker compose -f ./hack/docker-compose.dummy.yml down --volumes
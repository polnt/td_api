#!/bin/bash

docker compose -f ./hack/docker-compose.ci.yml up -d --build
docker exec api_test bash -c 'yarn --immutable && ./hack/wait_for_it.sh --timeout=0 --host=mysqldb_test --port=3306 -- yarn test:all'
docker compose -f ./hack/docker-compose.ci.yml down --volumes
docker rmi hack-api_test

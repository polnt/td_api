#!/bin/bash

cleanEnvironment() {
  docker compose -f ./cicd/docker-compose.ci.yml down --volumes
  docker rmi cicd-api_test
}

docker compose -f ./cicd/docker-compose.ci.yml up -d --build
docker exec api_test bash -c 'yarn build --noEmit && ./cicd/wait_for_it.sh --timeout=0 --host=mysqldb_test --port=3306 --strict -- yarn test'

[ $? -ne 0 ] && cleanEnvironment && exit 1

cleanEnvironment
exit 0

#!/bin/bash

cleanEnvironment() {
  docker compose down --volumes
}

docker compose up --detach
bash -c './cicd/wait_for_it.sh --timeout=30 --host=127.0.0.1 --port=3000'

rc=$?

[ $? -ne 0 ] && cleanEnvironment && exit 1

cleanEnvironment
exit $rc

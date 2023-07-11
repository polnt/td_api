# td_api

Rest API template written with [Typescript](https://www.typescriptlang.org/) and using [Express](https://expressjs.com/) and [MySQL](https://www.mysql.com/).

The purpose of this repo is to have a fast and flexible starter for a node.js REST API. 

## Requirements
- [Node.js 18+](https://nodejs.org/en)
- [Docker](https://docs.docker.com/get-docker/)
- [Yarn](https://yarnpkg.com/getting-started/install)

💡 You need to edit [.env.sample](./.env.sample) and rename it .env

## Usage
```
# Start stack
docker compose up

# First Usage - Initialize DB
docker compose -f docker-compose.yml -f docker-compose.initdb.yml up

# Stop and remove containers
docker compose down

# Delete (!definitively) database
docker compose down --volumes
```

## Development

```
yarn install
yarn dev

# First usage - Initialize database
docker compose -f docker-compose.yml -f docker-compose.initdb.yml up mysqldb --detach

# Start only API
yarn nodemon

# Stop and remove database container
yarn dev:stop

# Stop and delete database
yarn dev:clean
```

💡 In dev mode, only database runs in a container and data is stored locally

## Tests
```
yarn test:ci
```

## Documentation
- [API](http://localhost:3000/api-doc) - 💡 You need API to be up
- [CI/CD](./doc/cicd/cicd.md)

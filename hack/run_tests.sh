#!/bin/bash

docker docker:build
yarn ci
yarn docker:reset
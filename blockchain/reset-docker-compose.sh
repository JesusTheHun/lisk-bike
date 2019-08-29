#!/usr/bin/env bash

docker-compose stop
docker-compose start psql
docker exec -ti lisk-psql psql -h localhost -U lisk -d postgres -c "DROP DATABASE lisk_dev"
docker exec -ti lisk-psql psql -h localhost -U lisk -d postgres -c "CREATE DATABASE lisk_dev OWNER lisk"
docker-compose start nodejs
cd tests
node create-accounts.test.js
node create-bikes.test.js 9

#!/usr/bin/env bash

docker exec -ti lisk_sdk_db psql -h localhost -U lisk -d postgres -c "DROP DATABASE lisk_dev"
docker exec -ti lisk_sdk_db psql -h localhost -U lisk -d postgres -c "CREATE DATABASE lisk_dev OWNER lisk"

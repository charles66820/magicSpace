#!/usr/bin/env bash
docker-compose down
docker-compose -f docker-compose.yml -f production.yml up --build -d

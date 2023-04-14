#!/bin/bash

set -e

# wait for the postgres container to be ready
wait-for-it postgres:5432 -t 60 -- echo "postgres is up"

# generate the Prisma client
npx prisma migrate dev --name init && \
npx prisma generate

npm run build

# start the NestJS application
exec "$@"
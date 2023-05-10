#!/bin/bash

set -e

# wait for the Nestjs container to be ready
# wait-for-it nestjs:4000 -t 60 -- echo "nestjs is up"

npm run build

# start the React application
exec "$@"

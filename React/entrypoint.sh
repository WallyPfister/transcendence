#!/bin/bash

set -e

npm run build

# start the React application
exec "$@"

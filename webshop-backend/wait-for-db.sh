#!/bin/sh
set -e

host="$DB_HOST"
port="$DB_PORT"

echo "Wachten op MySQL op $host:$port ..."

while ! nc -z $host $port; do
  sleep 1
done

echo "MySQL is online, start backend"
exec ./webshop-backend

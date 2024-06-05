#!/bin/sh
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /ric/aws-lambda-rie /ric/node_modules/.bin/aws-lambda-ric $1
else
  exec /ric/node_modules/.bin/aws-lambda-ric $1
fi

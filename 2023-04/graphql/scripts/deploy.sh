#!/bin/bash
set -eu

if [ $# -ne 3 ]; then
  echo "Usage: $0 PROJECT_ID SERVICE_NAME"
  exit 1
fi

PROJECT_ID=$1
SERVICE_NAME=$2
ENV_VARS=$3

REGION="asia-northeast1"
TAG=$(date +"%Y%m%d%H%M%S")
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/chall/$SERVICE_NAME:$TAG"

docker build . -t "$IMAGE"
docker push "$IMAGE"
gcloud --project "$PROJECT_ID" run deploy "$SERVICE_NAME" \
  --region "$REGION" \
  --image "$IMAGE" \
  --set-env-vars "$ENV_VARS" \
  --allow-unauthenticated \
  --cpu 1 \
  --memory 512Mi \
  --timeout 3 \
  --concurrency 1

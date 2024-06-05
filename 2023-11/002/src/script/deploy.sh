PREFIX=missbox
docker compose run -it --rm cdk cdk deploy $PREFIX-container-stack
docker compose run -it --rm cdk cdk deploy $PREFIX-web-stack
docker compose run -it --rm cdk cdk deploy $PREFIX-api-stack $PREFIX-idp-stack -O /app/frontend/src/aws.json
docker compose run -it --rm frontend vite build
docker compose run -it --rm cdk cdk deploy $PREFIX-web-deploy-stack


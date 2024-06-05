docker compose run --rm cdk bash -c "cdk deploy -O ../frontend/aws.json Application"
docker compose run --rm frontend bash -c "npm run build"
docker compose run --rm cdk bash -c "cdk deploy ApplicationDeploy"

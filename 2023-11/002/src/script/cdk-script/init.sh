docker compose build cdk --no-cache
docker compose run --rm cdk bash -c "bash /app/init.sh"
docker compose run --rm awscli bash -c "aws sts get-caller-identity > /app/cdk/bin/awsinfo.json"
rm -rf ./cdk/.eslintrc.json
cp ./develop/cdk-node/.eslintrc.json ./cdk/.eslintrc.json

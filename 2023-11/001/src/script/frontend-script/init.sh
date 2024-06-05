docker compose build front --no-cache
docker compose run --rm installer bash -c "bash /app/init.frontend.sh"
rm -rf ./frontend/.eslintrc.cjs
cp ./develop/node/frontend-init/.eslintrc.cjs ./frontend/.eslintrc.cjs
rm -rf ./.git

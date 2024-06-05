echo "[INFO] Start init.sh"
echo "[INFO] Create assets directory"
mkdir -p ./credentials
touch ./credentials/aws
docker compose build --no-cache

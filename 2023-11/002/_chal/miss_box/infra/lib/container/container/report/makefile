CONTAINER_NAME=contact
build:
	@echo "Building $(CONTAINER_NAME) container"
	@docker build --platform linux/amd64 -t $(CONTAINER_NAME) . 
build-no-cache:
	@echo "Building $(CONTAINER_NAME) container"
	@docker build --platform linux/amd64 -t $(CONTAINER_NAME) . --no-cache
run:
	@echo "Running $(CONTAINER_NAME) container"
	@docker run -it --rm --name ${CONTAINER_NAME} -d -p 9000:8080 $(CONTAINER_NAME)
run-watch:
	@echo "Running $(CONTAINER_NAME) container"
	@docker run --env DOMAIN="open-azara-s3.s3.ap-northeast-1.amazonaws.com" --env ALLOWED_URL="https://open-azara-s3.s3.ap-northeast-1.amazonaws.com/" --volume ./tmp:/tmp/ -it --rm --name ${CONTAINER_NAME} -p 9000:8080 $(CONTAINER_NAME) 
ps:
	@echo "Listing running containers"
	@docker ps
stop:
	@echo "Stopping $(CONTAINER_NAME) container"
	@docker stop $(CONTAINER_NAME)

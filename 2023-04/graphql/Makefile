DIST := src/* static/* database.db docker-compose.yml Dockerfile package.json schema.gql schema.sql tsconfig.json yarn.lock

DIST_ZIP := chall/dist.zip
DATE := 202307190000.00

SERVICE_NAME := graphql

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"

.PHONY: deploy
deploy:
ifndef PROJECT_ID
	$(error PROJECT_ID is not defined)
endif
	./scripts/deploy.sh $(PROJECT_ID) $(SERVICE_NAME) "GOOGLE_PROJECT_ID=$(PROJECT_ID),FLAG1=flag{flag1__you_got_flag_t5uy2p},FLAG2=flag{flag2__complexity_is_not_complex_cj4j81},FLAG3=flag{flag3__my_implementation_is_so_bad_b61vo2},FLAG4=flag{flag4__you_found_a_bug_in_the_library_xun2wt}"

.PHONY: gen-database
gen-database:
	rm -f database.db
	sqlite3 database.db < schema.sql
	yarn run -s ts-node-esm scripts/gen.ts

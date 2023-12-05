DIST := bun.lockb compose.yaml Dockerfile package.json server.ts tsconfig.json

DIST_ZIP := _chal/x.zip
DATE := 202312050000.00

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"

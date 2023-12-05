DIST := bun.lockb compose.yaml Dockerfile flag getflag.c index.html package.json server.ts tsconfig.json

DIST_ZIP := _chal/busybox2.zip
DATE := 202312050000.00

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"

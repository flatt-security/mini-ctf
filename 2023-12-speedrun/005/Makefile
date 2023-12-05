DIST := compose.yaml default.conf.template Dockerfile nginx.conf

DIST_ZIP := _chal/nginx.zip
DATE := 202312050000.00

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"

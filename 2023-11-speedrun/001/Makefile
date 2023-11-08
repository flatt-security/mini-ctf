DIST := compose.yaml Dockerfile requirements.txt server.py

DIST_ZIP := _chal/deny.zip
DATE := 202311090000.00

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"
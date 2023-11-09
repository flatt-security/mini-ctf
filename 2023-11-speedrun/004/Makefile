DIST := bin/* lib/* web/* compose.yaml Dockerfile pubspec.lock pubspec.yaml old_arrow.zip

DIST_ZIP := _chal/arrow.zip
DATE := 202311090000.00

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"
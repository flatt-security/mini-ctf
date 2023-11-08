DIST := config/* compose.yaml config.ru Dockerfile Gemfile Gemfile.lock server.rb

DIST_ZIP := _chal/gem.zip
DATE := 202311090000.00

.PHONY: dist
dist:
	rm -f $(DIST_ZIP)
	touch -t $(DATE) $(DIST)
	zip $(DIST_ZIP) $(DIST) -x "*/.*"
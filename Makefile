SHELL := /bin/bash

build:
	@interleave build src/geojs.js --wrap

test:
	@mocha --reporter spec

.PHONY: test
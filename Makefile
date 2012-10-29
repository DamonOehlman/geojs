SHELL := /bin/bash

build:
	@interleave build src/geojs.js --output ./

test:
	@mocha --reporter spec

.PHONY: test
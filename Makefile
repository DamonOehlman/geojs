SHELL := /bin/bash

build:
	@interleave src/geojs.js --package

test:
	@mocha --reporter spec

.PHONY: test
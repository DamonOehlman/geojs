SHELL := /bin/bash

build:
	@interleave src/geojs.js --package
	@interleave src/addins/ --package

test:
	@mocha --reporter spec

.PHONY: test
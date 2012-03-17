SHELL := /bin/bash

build:
	@interleave src --after uglify

test:
	@mocha --reporter spec

.PHONY: test
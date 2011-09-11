CWD=`pwd`

build:
	@node build.js

test:
	node test/main.js

.PHONY: test
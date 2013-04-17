default:
	@echo "CubeViz - cli"
	@echo "   make install-build-tools ............. > install only TypeScript required software"
	@echo "   make install-all-build-tools ......... > install all necessary software to build and minimize JavaScript files"
	@echo " "
	@echo "   make build-javascript ................ > transform TypeScript files into JavaScript"
	@echo "   make build-and-minimize-javascript ... > transform TypeScript and minimize generated files afterwards"

build-javascript:
	@echo "Build Javascript files, out of TypeScript files ..."
	tsc --out ../public/javascript/Main.js @tsc/Main.txt
	tsc --out ../public/javascript/Test.js @tsc/Test.txt

build-and-minimize-javascript:
	make build-javascript
	@echo ""
	@echo "Minimize JavaScript file (../public/javascript/Main-production.js)"
	node minifier.js

install-typescript:
	# PPA with stable node.js and npm
	sudo apt-add-repository ppa:chris-lea/node.js-legacy
	
	# update package information
	sudo apt-get update
	
	# install node.js and TypeScript
	sudo apt-get install nodejs npm && sudo npm install -g typescript

install-all-build-tools:
	
	make install-typescript
	
	# install 
	sudo apt-get install openjdk-7-jre
	
	# install node.js modules
	sudo npm install -g typescript
	sudo npm install -g node-minify
	sudo npm link node-minify

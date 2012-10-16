default:
	@echo "CubeViz - cli"
	@echo " make install > setup cubeviz"
	@echo " make install-typescript > install npm and typescript over npm"
	@echo " make build-javascript > build javascript files"
	@echo " make test > run PHPUnit tests"
	@echo " "
	@echo "To setup the test environment run this commands in a row:"
	@echo " make install-phpunit > install PHPUnit"
	@echo " make setup-testenvironment > setup test environment"
	
build-javascript:	
	@echo "Build Javascript files, out of TypeScript files ..."
	@echo " "
	@echo "Build static/javascript/Cubeviz_Module.js ... "
	tsc --out static/javascript/frontend/Cubeviz_Module.js @static/typescript/tsc_arguments/Cubeviz_Module.txt
	@echo " "
	
install:
	chmod 0777 data/links
	
install-phpunit:
	sudo apt-get install php-pear
	sudo pear config-set auto_discover 1
	sudo pear channel-update pear.php.net
	sudo pear upgrade pear
	sudo pear install -a pear.phpunit.de/PHPUnit
	
install-typescript:
	sudo apt-get install npm && sudo npm install -g typescript

setup-testenvironment:
	cp ../../config.ini ../../libraries/Erfurt/Erfurt/config.ini
		
test:
	phpunit --stderr tests

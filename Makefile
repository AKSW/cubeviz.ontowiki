default:
	@echo "CubeViz - cli"
	@echo " make install > setup cubeviz"
	@echo " make test > run PHPUnit tests"
	@echo " "
	@echo "To setup the test environment run this commands in a row:"
	@echo " make install-phpunit > install PHPUnit"
	@echo " make setup-testenvironment > setup test environment"

test:
	phpunit --stderr tests

setup-testenvironment:
	cp ../../config.ini ../../libraries/Erfurt/Erfurt/config.ini

install-phpunit:
	sudo apt-get install php-pear
	sudo pear config-set auto_discover 1
	sudo pear channel-update pear.php.net
	sudo pear upgrade pear
	sudo pear install -a pear.phpunit.de/PHPUnit

install:
	chmod 0777 data/links

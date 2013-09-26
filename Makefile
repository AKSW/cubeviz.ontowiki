default:
	@echo "CubeViz - CLI"
	@echo "    make install > Setup CubeViz"
	@echo ""
	@echo "  Test Environment"
	@echo "    make install-test-environment > Setup PHPUnit 3.5.15 using PEAR"
	@echo "    make purge-test-environment > Purge PHPUnit 3.5.15 in PEAR"
	@echo "    make test > Test PHP side of CubeViz"
	@echo ""
	@echo " Package Generation"
	@echo "    make cubeviz > Generate tar.gz archive in generated-packages folder"
	@echo "    make ontowiki > Generate an stand-alone ready-to-use OntoWiki archive"
	@echo ""
	
install:
	cp ChartConfig.js.dist ChartConfig.js
	cp doap.n3.dist doap.n3

ontowiki:
	sh deployment/scripts/createOntoWiki.sh
	
cubeviz:
	sh deployment/scripts/createCubeViz.sh
	
#
# Test Environment
#
	
install-test-environment:
	sudo pear config-set auto_discover 1
	sudo pear channel-update pear.php.net
	sudo pear install pear.symfony-project.com/YAML-1.0.2
	sudo pear install phpunit/PHPUnit_Selenium-1.0.1
	sudo pear install phpunit/PHPUnit_MockObject-1.0.3
	sudo pear install phpunit/PHP_Timer-1.0.0
	sudo pear install phpunit/File_Iterator-1.2.3
	sudo pear install phpunit/PHP_CodeCoverage-1.0.2
	sudo pear install phpunit/Text_Template-1.1.4
	sudo pear install phpunit/DbUnit-1.0.0
	sudo pear install phpunit/PHPUnit-3.5.15
	
purge-test-environment:
	sudo pear uninstall phpunit/PHPUnit
	sudo pear uninstall phpunit/DbUnit
	sudo pear uninstall phpunit/PHP_CodeCoverage
	sudo pear uninstall phpunit/File_Iterator
	sudo pear uninstall phpunit/PHPUnit_MockObject
	sudo pear uninstall phpunit/Text_Template
	sudo pear uninstall phpunit/PHP_Invoker
	sudo pear uninstall phpunit/PHP_Timer
	sudo pear uninstall phpunit/PHPUnit_Selenium
	sudo pear uninstall pear.symfony-project.com/YAML

test:
	phpunit --stderr tests


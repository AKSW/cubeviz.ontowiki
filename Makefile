default:
	@echo "CubeViz - cli"
	@echo " make install > setup cubeviz"
	@echo ""
	@echo "Package generation"
	@echo " make tar > Generate tar.gz archive in generated-packages folder"
	@echo " make ontowiki > Generate an stand-alone ready-to-use OntoWiki archive"
	@echo ""
	
install:
	cp ChartConfig.js.dist ChartConfig.js

ontowiki:
	sh deployment/scripts/createOntoWiki.sh
	
tar:
	sh deployment/scripts/createTar.sh

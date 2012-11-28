default:
	@echo "CubeViz - cli"
	@echo " make install > setup cubeviz"
	@echo " make install-typescript > install npm and typescript over npm"
	@echo " make build-javascript > build javascript files"
	
build-javascript:	
	@echo "Build Javascript files, out of TypeScript files ..."
	@echo " "
	@echo "Build static/javascript/Cubeviz_Module.js ... "
	tsc --out static/javascript/frontend/Cubeviz_Module.js @static/typescript/tsc_arguments/Cubeviz_Module.txt
	@echo " "
	@echo "Build static/javascript/Cubeviz_Viz.js ... "
	tsc --out static/javascript/frontend/Cubeviz_Viz.js @static/typescript/tsc_arguments/Cubeviz_Viz.txt
	@echo " "
	
install:
	cp ChartConfig.js.dist ChartConfig.js
	
install-typescript:
	sudo apt-get install npm && sudo npm install -g typescript

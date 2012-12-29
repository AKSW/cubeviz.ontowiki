default:
	@echo "CubeViz - cli"
	@echo " make install-typescript > install npm and typescript over npm"
	@echo " make build-javascript > build javascript files"
	
build-javascript:	
	@echo "Build Javascript files, out of TypeScript files ..."
	@echo " "
	@echo "Build cubeviz/public/javascript/Cubeviz_Module.js ... "
	tsc --out ../public/javascript/frontend/Cubeviz_Module.js @tsc/Cubeviz_Module.txt

install-typescript:
	sudo apt-get install npm && sudo npm install -g typescript

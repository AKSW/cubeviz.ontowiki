default:
    @echo "CubeViz - cli"
    @echo " make install-typescript > install npm and typescript over npm"
    @echo " make build-javascript > build Main.js (out of typescript files)"
    
build-javascript:    
    @echo "Build Javascript file, out of TypeScript files ..."
    tsc --out ../public/javascript/Main.js @tsc/Main.txt
    tsc --out ../public/javascript/Test.js @tsc/Test.txt

install-typescript:
    sudo apt-get install npm && sudo npm install -g typescript

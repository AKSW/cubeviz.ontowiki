# manual debian packaging steps

* clone cubeviz.ontowiki repo to ontowiki-cubeviz directory (name of the package)
* mv deployment/debian to debian in cubeviz root
* cd ./debian/Makefile; make prepare
* cd ./debian/; dch -i (then edit file)
* debuild

# post processing

* cd ./debian/Makefile; make clean
* mv debian deployment/debian
* commit and push changes in deployment/debian


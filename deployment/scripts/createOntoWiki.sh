#!/bin/bash

# Set variables
cubevizRoot="$PWD"
ontowikiRoot="$PWD/../.."
cubevizPackage="cubeviz"
packageName="ontowiki-cubeviz"


# Start the action ...
rm -rf $cubevizRoot/deployment/generated-packages/$packageName

mkdir $cubevizRoot/deployment/generated-packages/$packageName

cd $cubevizRoot/deployment/generated-packages/$packageName

echo ""
echo " Copy necessary files of OntoWiki, exclude obsolete ones"
echo ""

rsync -av --exclude='.git' \
          --exclude='.gitignore' \
          --exclude='*.git' \
          --exclude='config.ini' \
          --exclude='build' \
          --exclude='application/logo' \
          --exclude='application/tests' \
          --exclude='application/scripts' \
          --exclude='debian' \
          --exclude='extensions/auth' \
          --exclude='extensions/bookmarklet' \
          --exclude='extensions/ckan' \
          --exclude='extensions/community' \
          --exclude='extensions/cors' \
          --exclude='extensions/cubeviz' \
          --exclude='extensions/datagathering' \
          --exclude='extensions/defaultmodel' \
          --exclude='extensions/exconf' \
          --exclude='extensions/files' \
          --exclude='extensions/filter' \
          --exclude='extensions/googletracking' \
          --exclude='extensions/hideproperties' \
          --exclude='extensions/history' \
          --exclude='extensions/imagelink' \
          --exclude='extensions/imprint' \
          --exclude='extensions/jsonrpc' \
          --exclude='extensions/linkeddataserver' \
          --exclude='extensions/literaltypes' \
          --exclude='extensions/mailtolink' \
          --exclude='extensions/manchester' \
          --exclude='extensions/markdown' \
          --exclude='extensions/navigation' \
          --exclude='extensions/pingback' \
          --exclude='extensions/queries' \
          --exclude='extensions/resourcecreationuri' \
          --exclude='extensions/resourcemodules' \
          --exclude='extensions/savedqueries' \
          --exclude='extensions/selectlanguage' \
          --exclude='extensions/semanticsitemap' \
          --exclude='extensions/sendmail' \
          --exclude='extensions/sindice' \
          --exclude='extensions/sortproperties' \
          --exclude='extensions/source' \
          --exclude='extensions/weblink' \
          --exclude='cache/*' \
          --exclude='libraries/ARC2' \
          --exclude='libraries/Erfurt/.git' \
          --exclude='libraries/Erfurt/.gitignore' \
          --exclude='libraries/Erfurt/build.xml' \
          --exclude='libraries/Erfurt/Makefile' \
          --exclude='libraries/Erfurt/README.md' \
          --exclude='libraries/Erfurt/build' \
          --exclude='libraries/Erfurt/debian' \
          --exclude='libraries/Erfurt/tests' \
          --exclude='libraries/Erfurt/library/config.ini-dist-multistore' \
          --exclude='libraries/Erfurt/library/config.ini-dist-mysql' \
          --exclude='libraries/Erfurt/library/config.ini-dist-virtuoso' \
          --exclude='libraries/RDFauthor/.git' \
          --exclude='libraries/RDFauthor/.hgignore' \
          --exclude='libraries/RDFauthor/build.xml' \
          --exclude='libraries/RDFauthor/Readme.md' \
          --exclude='libraries/RDFauthor/debian' \
          --exclude='libraries/RDFauthor/tests' \
          --exclude='libraries/Zend/Amf' \
          --exclude='libraries/Zend/Barcode' \
          --exclude='libraries/Zend/Console' \
          --exclude='libraries/Zend/Dojo' \
          --exclude='libraries/Zend/Gdata' \
          --exclude='libraries/Zend/LDAP' \
          --exclude='libraries/Zend/InfoCard' \
          --exclude='libraries/Zend/Locale' \
          --exclude='libraries/Zend/Mail' \
          --exclude='libraries/Zend/Pdf' \
          --exclude='libraries/Zend/Search' \
          --exclude='libraries/Zend/Service' \
          --exclude='libraries/Zend/Test' \
          --exclude='libraries/Zend/Date.php' \
          --exclude='logs/*' \
          $ontowikiRoot/* .
          
echo ""
echo " Copy additional files and extensions "
echo ""

cp -R $ontowikiRoot/.htaccess .
cp -R $cubevizRoot/deployment/additional-files/config.ini .
cp -R $cubevizRoot/deployment/additional-files/extensions/page extensions
cp -R $cubevizRoot/deployment/additional-files/extensions/staticlinks extensions

cp -R $cubevizRoot/deployment/additional-files/extensions/examplemodel extensions
cp -R $cubevizRoot/assets/exampleCube.ttl extensions/examplemodel/static/data


mkdir libraries/Zend/Locale/
mkdir libraries/Zend/Locale/Data/
cp $cubevizRoot/deployment/additional-files/libraries/Zend/Translation.php \
   libraries/Zend/Locale/Data/Translation.php


# Dirty hack for stupid error message
cp $cubevizRoot/deployment/additional-files/libraries/Erfurt/Parser.php \
   $ontowikiRoot/libraries/Erfurt/library/libraries/Erfurt/Sparql/Parser.php

echo ""
echo " Delete unneccessary files "
echo ""

rm build.xml
rm config.ini.dist
rm Makefile
rm README.md
rm web.config

rm -rf logs/*

echo ""
echo "Generate lightweight CubeViz version (make tar)"
echo ""

cd ../../..
make tar # generates a lightweight cubeviz tar.gz
cd deployment/generated-packages 
tar -zxvf $cubevizPackage.tar.gz # Unzip this tar.gz
mv $cubevizPackage $packageName/extensions

echo ""
echo "Tar folder $packageName to $packageName.tar.gz"
echo ""

rm -f $packageName.7z
7z a -mx=8 -mfb=64 -md=64m $packageName.7z $packageName
rm -rf $packageName

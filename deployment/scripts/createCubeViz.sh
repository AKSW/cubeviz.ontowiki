#!/bin/bash

# Set variables
cubevizRoot="$PWD"
packageName="cubeviz"


# Start the action ...
echo ""
echo "- Delete previously created tar-package folder in generated-packages"
rm -rf $cubevizRoot/deployment/generated-packages/$packageName

echo ""
echo "- Create tar-package folder in generated-packages"
mkdir $cubevizRoot/deployment/generated-packages/$packageName

echo ""
echo "- Copy files to tar-package folder:"
echo ""
rsync -av --exclude='.git' \
		  --exclude='assets' \
		  --exclude='ChartConfig.js' \
		  --exclude='data' \
		  --exclude='deployment' \
		  --exclude='doap.n3' \
		  --exclude='Makefile' \
		  --exclude='public/javascript/Test.js' \
		  --exclude='public/javascript/Main.js' \
		  --exclude='README.md' \
		  --exclude='tests' \
          --exclude='typescript' \
          $cubevizRoot/* $cubevizRoot/deployment/generated-packages/$packageName

echo ""
echo "- Copy files (README, adapted Makefile, ChartConfig.js)"
mv $cubevizRoot/deployment/generated-packages/$packageName/LICENSE.md          $cubevizRoot/deployment/generated-packages/$packageName/LICENSE.txt
cp $cubevizRoot/deployment/additional-files/Makefile                           $cubevizRoot/deployment/generated-packages/$packageName
cp $cubevizRoot/README.md                                                      $cubevizRoot/deployment/generated-packages/$packageName/README.txt
mv $cubevizRoot/deployment/generated-packages/$packageName/ChartConfig.js.dist $cubevizRoot/deployment/generated-packages/$packageName/ChartConfig.js
mv $cubevizRoot/deployment/generated-packages/$packageName/doap.n3-dist        $cubevizRoot/deployment/generated-packages/$packageName/doap.n3

echo ""
echo "- Generate archive"
cd deployment/generated-packages
rm -f $packageName.tar.gz
tar -pcvzf $packageName.tar.gz $packageName

echo ""
echo "- Remove folder cubeviz"
rm -rf cubeviz

echo ""

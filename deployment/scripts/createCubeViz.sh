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
		  --exclude='data' \
		  --exclude='deployment' \
		  --exclude='additional-files' \
		  --exclude='ChartConfig.js' \
		  --exclude='data' \
		  --exclude='generated-packages' \
		  --exclude='Makefile' \
		  --exclude='scripts' \
		  --exclude='typescript' \
		  --exclude='README.md' \
          $cubevizRoot/* $cubevizRoot/deployment/generated-packages/$packageName

echo ""
echo "- Copy files (README, adapted Makefile, ChartConfig.js)"
mv $cubevizRoot/deployment/generated-packages/$packageName/LICENSE.md          $cubevizRoot/deployment/generated-packages/$packageName/LICENSE.txt
cp $cubevizRoot/deployment/additional-files/Makefile                           $cubevizRoot/deployment/generated-packages/$packageName
cp $cubevizRoot/README.md                                                      $cubevizRoot/deployment/generated-packages/$packageName/README.txt
mv $cubevizRoot/deployment/generated-packages/$packageName/ChartConfig.js.dist $cubevizRoot/deployment/generated-packages/$packageName/ChartConfig.js

echo ""
echo "- Generate archive"
cd deployment/generated-packages && rm -f $packageName.tar.gz && tar czf $packageName.tar.gz $packageName

echo ""
echo "- Remove folder cubeviz"
rm -rf cubeviz

echo ""

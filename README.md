# Visualization of statistics in the Linked Data Web with CubeViz

CubeViz is based on the award winning Semantic Wiki technology [OntoWiki](http://ontowiki.net/Projects/OntoWiki) which offers possibilities to visualize statistical data in a generic way. The statistical data itself has to be in [RDF data format](http://localhost/ow_cubeviz_odp/www.w3.org/RDF/) designed by using the [RDF DataCube vocabulary](http://www.w3.org/TR/vocab-data-cube/).


## What is it about?

The Visualization of and the access to statistical data becomes more and more important since the amount of available data in the web is increasing. CubeViz addresses this issue and offers user-friendly exploration possibilities. At the moment CubeViz offers basic chart types to explore up to two dimensions in a data structure. Due to the fact that statistics can be much more complex, we will offer more chart types and additional facetted browsing possibilities as part of CubeViz in the near future.


## Try it out!

Want to play with CubeViz? Just [install](https://github.com/AKSW/OntoWiki/wiki/Getting-Started-Users) OntoWiki, if you haven't yet and clone CubeViz repository into OntoWiki root-folder/extensions. After that you need a knowledge base which contains RDF DataCube data. Thats it, now you are ready to use CubeViz.


## About internals

This repository has 4 branches. The **master** branch contains the latest stable release, stable in terms of "it should be stable in the most cases". CubeViz is under heavy development, so it is possible that something could went wrong. 
The other 3 branches have the prefix _version_: **version0** is where the development starts and only for backup. Same goes for __version1__, our first prototype containing refactored code of version0. 
Recent development happens in **version2**. If want cutting edge functionality and being familiar with PHP and Javascript, this branch is for you.

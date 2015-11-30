# CubeViz - THE RDF DATACUBE BROWSER 

CubeViz is an [OntoWiki](http://aksw.org/Projects/OntoWiki.html) component providing faceted browsing in statistical 
data in the Linked Data Web. It was set up and adopted to be part of the 
[Data Portal](https://ec.europa.eu/digital-agenda/en/scoreboard) of the European Union. 
CubeViz utilizing the  [RDF DataCube vocabulary](http://www.w3.org/TR/vocab-data-cube/) 
which is the state-of-the-art in representing statistical data in [Resource Description Framework (RDF)](http://www.w3.org/RDF/). 
This vocabulary is compatible with [SDMX](http://en.wikipedia.org/wiki/SDMX) 
([User Guide](http://sdmx.org/wp-content/uploads/2012/11/SDMX_2-1_User_Guide_draft_0-1.pdf)) and increasingly being adopted. 
Based on the vocabulary and the encoded Data Cube, CubeViz is generating a facetted browsing widget that 
can be used to filter interactively observations to be visualized in charts. 
Based on the selected structure, CubeViz offer beneficiary chart types and options which can be selected by users.

Do you want to read further information about the project and its background, please have a look into 
[**about**](https://github.com/AKSW/cubeviz.ontowiki/wiki/About-the-project) page.

![](https://raw.github.com/wiki/AKSW/cubeviz.ontowiki/images/v0.5_IndexActionScreenshot.png)

![](https://raw.github.com/wiki/AKSW/cubeviz.ontowiki/images/v0.6_visualization.png)

## Getting started

You will find various information in our [Wiki](https://github.com/AKSW/cubeviz.ontowiki/wiki/Home).
For new users, please visit Page [installation](https://github.com/AKSW/cubeviz.ontowiki/wiki/Installation-and-setup-main) 
to get an introduction about installation and setup of CubeViz.

Further information about the repository structure or other internals can be also found in the Wiki.

### Docker container available

We providing a Docker container for everybody, who don't want to bother about getting OntoWiki running or struggles with Virtuoso. That container only needs a Docker and can be used with `docker pull` + `docker run`. How easy is that?! 

Basically it ships with a fully fledged OntoWiki, pre-filled Virtuoso store and up and running CubeViz. After you started the container, you can use your browser and directly use CubeViz.

To pull the container just run: 

`docker pull aksw/dld-present-cubeviz`

To run it, please use:

`docker run -d -p 8080:80 -p 8890:8890 cubeviz`

For further information, please look in following the project page.

**Project page:** [Dockerizing/CubeViz](https://github.com/Dockerizing/CubeViz)

## CubeViz compared to other tools

*(Last updated 2015-11-30)*

We created a comparison of CubeViz and other tools, which are supporting DataCube vocabulary. It is based on the support of elements which are mentioned in the vocabulary. The purpose of that overview is to provide users, who are interested in using CubeViz, further information of its DataCube vocabulary supportin comparison to other tools.

*If you encounter erros or wanna mention something, please make a pull request, create an issue or send us an email.*

`(✓)` - Similar like CubeViz but not equivalent

| Supported Features                | CubeViz | OpenCube | LDCX | LSD Analysis    |
|-----------------------------------|:-------:|:--------:|:----:|:---------------:|
| **Explore RDF Data**              |         |          |      |                 |
| Select parts of the Dataset       |    ✓    |    ✓     |  ✓   |       (✓)       |
| Select Units and Measurements     |    ✓    |    ✓     |  ✓   |       (✓)       |
| Multiple Chart Visualization      |    ✓    |   (✓)    |  \-  |       \-        |
| Configure Dimensions              |    ✓    |    \-    |  ✓   |       \-        |
|                                   |         |          |      |                 |
| Collaborative Exploration/Edit    |    ✓    |    \-    |  \-  |   ✓ (Explore)   |
|                                   |         |          |      |                 |
| **Compare Datasets**              |         |          |      |       (✓)       |
| Compare Meta Information          |    ✓    |    \-    |  \-  |       \-        |
| Observation Values Normalization  |    ✓    |    \-    |  \-  |       \-        |
| Set Dimension Elements            |    ✓    |    \-    |  \-  |       \-        |
| Show Cluster                      |    ✓    |    \-    |  \-  |       \-        |
|                                   |         |          |      |                 |
| **Data Download**                 |         |          |      |                 |
| Download as CSV                   |    ✓    |    ✓     |  \-  |        ✓        |
| Download as Turtle                |    ✓    |    \-    |  \-  |       \-        |
|                                   |         |          |      |                 |
| Hierarchy Slices                  |   \-    |    \-    |  \-  |       \-        |
| OLAP Operations (Sum, Avg, Pivot) |   \-    |    ✓     |  \-  |       \-        |
| Mobile UI                         |   \-    |    \-    |  \-  |       \-        |
| Analysis Task (R Script)          |   \-    |    ✓     |  \-  | ✓ (Server-Side) |
| Geospatial Data Visualization     |   \-    |    ✓     |  \-  |       \-        |
| Visualizations with dimensions >2 |   \-    |    \-    |  \-  |       \-        |

#### Links to the mentioned tools

-	[OpenCube](http://opencube-toolkit.eu)  
-	[LDCX](http://km.aifb.kit.edu/projects/ldcx/)  
-	[LSD Analysis](http://stats.270a.info/analysis/worldbank:SP.DYN.IMRT.IN/transparency:CPI2011/year:2011.html)

## License

CubeViz is licensed under the terms of GNU General Public License 2 and it uses foreign libraries. 
For further details have a look in [here](https://github.com/AKSW/cubeviz.ontowiki/blob/master/LICENSE.md).

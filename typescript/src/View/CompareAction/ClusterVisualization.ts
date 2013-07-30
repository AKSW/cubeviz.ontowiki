/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_ClusterVisualization extends CubeViz_View_Abstract 
{    
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_ClusterVisualization", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onCreated_mergedDataCube",
                handler: this.onCreated_mergedDataCube
            }
        ]);
    }
    
    /**
     *
     */
    public generateLink(numberOfClusters) 
    {
        var clusteringDataCube:any = null,
            clusters:number[][] = [],
            hash:string = "",
            selectedMeasureUri = this.app._.compareAction.mergedDataCube.selectedComponents
                                 .measure["http://purl.org/linked-data/cube#measure"],
            self = this;
        
        // compute clusters based on vlaues from merged data cube
        clusters = this.numberClustering (
            // values of observations from merged data cube
            DataCube_Observation.getValues(
                this.app._.compareAction.mergedDataCube.retrievedObservations,
                selectedMeasureUri,
                true
            )[0],
            numberOfClusters
        );
        
        /**
         * build data set to visualize the clusters
         */
        clusteringDataCube = DataCube_ClusteringDataCube.create(
            clusters, this.app._.backend.url, numberOfClusters,
            this.app._.compareAction.mergedDataCube.retrievedObservations, 
            this.app._.compareAction.mergedDataCube.selectedComponents.measure["http://purl.org/linked-data/cube#measure"],
            this.app._.compareAction.mergedDataCube.selectedDS
        );
    
        hash = CryptoJS.MD5(JSON.stringify(clusteringDataCube))+"";
        
        // generate hash for clustering data cube
        CubeViz_ConfigurationLink.saveData(
            this.app._.backend.url, this.app._.backend.modelUrl, hash, 
            clusteringDataCube, function(){
                /*
                var uiObject:any = {
                    visualization: {
                        className: ""
                    },
                    visualizationSettings: {}
                };
                
                CubeViz_ConfigurationLink.save(
                    this.app._.backend.url, this.app._.backend.modelUrl, 
                    JSON.stringify(uiObject), "ui", 
                    function(dataHash){
                */
                
                
                console.log("");
                console.log("clusteringDataCube (" + hash + ")");
                console.log(clusteringDataCube);
                
                // build link
                var $li = $("<li><a href=\"\">Visualization for maximum " + numberOfClusters + " cluster</a></li>");
                
                var link = self.app._.backend.url + "?";
                
                if (false === _.isNull(self.app._.backend.serviceUrl)) {
                    link += "serviceUrl=" + encodeURIComponent (self.app._.backend.serviceUrl)
                            + "&";
                }
                           
                if (true === _.str.isBlank(self.app._.backend.modelUrl)) {
                    link += "m=" + encodeURIComponent (self.app._.compareAction.models[1].__cv_uri);
                } else {
                    link += "m=" + encodeURIComponent (self.app._.backend.modelUrl);
                }
                
                link += "&cv_dataHash=" + hash;
                
                $($li.find ("a"))
                    .attr ("href", link)
                    .attr ("target", "_blank");
                
                $("#cubeviz-compare-clusterVisualizationLinks").append ($li);
                
                
            }, true
        );
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        this.render();
    }
    
    /**
     * Algorithm for clustering numbers with a fixed size of clusters.
     */
    public numberClustering(numberList:number[], numberOfClusters) : number[][]
    {
        var betterClusterIndex:number = 0,
            changeHappened:bool = true,
            clusterCenters:number[] = [],
            clusters:number[][] = [],
            computedDistance:number = 0,
            iterations:number = 0,
            numberOfElements:number = numberList.length,
            maxClusterSize:number = Math.round(numberOfElements/numberOfClusters)+1,
            nearestDistance:number = 0,
            sliceStart:number = 0,
            sliceEnd:number = maxClusterSize,
            tmpNumber:number = 0;
        
        // sort number list
        numberList.sort(function(a,b){
            return a-b;
        });

        // rough clustering numbers    
        for (var i = 0; i < numberOfClusters; ++i) {            
            clusters [i] = numberList.slice(sliceStart, sliceEnd);
            sliceStart += maxClusterSize;
            sliceEnd += maxClusterSize;
        }
        
        // if there are elements left
        if (sliceStart < numberOfElements) {
            var missingElements = numberList.slice(sliceStart, numberOfElements-sliceStart);
            _.each (missingElements, function(number){
                clusters [numberOfClusters-1].push (number);
            });
        }
        
        // compute centers for each cluster
        for (i = 0; i < numberOfClusters; ++i) {
            tmpNumber = 0;
            _.each (clusters [i], function(number){
                tmpNumber += number;
            });
            clusterCenters [i] = tmpNumber / clusters [i].length;
        }
        
        do {
            changeHappened = false;
            
            // move numbers if their current center more far away than another one
            for (i = 0; i < numberOfClusters; ++i) {
                
                // go through all numbers of a cluster
                _.each (clusters [i], function(number, key){
                    nearestDistance = -1;
                    computedDistance = 0;
                    
                    // check distance to each center
                    _.each (clusterCenters, function(center, clusterIndex){
                        if (center > number) {
                            computedDistance = center - number;
                        } else {
                            computedDistance = number - center;
                        }
                        
                        if (-1 == nearestDistance 
                            || computedDistance <= nearestDistance) {
                            nearestDistance = computedDistance;
                            betterClusterIndex = clusterIndex;
                        }
                    });
                    
                    if (betterClusterIndex != i){
                        clusters[betterClusterIndex].push (number);
                        clusters[i].splice (key, 1);
                        changeHappened = true;
                    }
                });
            }   
        } while (true === changeHappened);
        
        // sort each cluster
        _.each (clusters, function(cluster){
            cluster.sort(function(a,b){
                return a-b;
            });
        });
        
        return clusters;
    }
    
    /**
     *
     */
    public onClick_getLinkBtn() 
    {
        this.generateLink (
            $("#cubeviz-compare-clusterVisualizationClusterNumber").val()
        );
    }

    /**
     *
     */
    public onCreated_mergedDataCube() 
    {
        this.initialize();
    }
    
    /**
     * 
     */
    public render() : CubeViz_View_Abstract
    {
        this.bindUserInterfaceEvents({
            "click #cubeviz-compare-clusterVisualizationGetLinkBtn": this.onClick_getLinkBtn
        });
        
        return this;
    }
}

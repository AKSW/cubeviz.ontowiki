/**
 * Its main purpose is to generate an artifical data cube for clustering
 */
class DataCube_ClusteringDataCube
{    
    /**
     *
     */
    static buildDataSets(dataCubeUri:string, clusters:number[][], numberOfClusters:number) 
    {
        // get the lowest and highest number out of the given clusters
        var lowestNumber:number = clusters [0][0],
            highestNumber:number = clusters [numberOfClusters-1]
                                            [_.size(clusters [numberOfClusters-1])-1];
        
        return { 0: {
            
            // label
            __cv_niceLabel: 
                "Dataset for " + numberOfClusters + " cluster with overall values between " +
                lowestNumber + " and " + highestNumber,
            "http://www.w3.org/2000/01/rdf-schema#label": 
                "Dataset for " + numberOfClusters + " cluster with overall values between " +
                lowestNumber + " and " + highestNumber,

            // uri
            __cv_uri: dataCubeUri + "dataset",
            __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "dataset") + "",

            // dsd
            "http://purl.org/linked-data/cube#structure": dataCubeUri + "datastructuredefinition",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataSet",
                
            // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
            "http://purl.org/dc/terms/created": (new Date()).toString()       
        }};
    }

    /**
     *
     */
    static buildDataStructureDefinitions(dataCubeUri:string, dimensions:any) : any
    {
        var dsd:any = { 0: {
            
                // label
                __cv_niceLabel: "Artifical Data Structure Definition",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Data Structure Definition",
                
                // describe
                __cv_description: "",
                
                // uri and hashed uri
                __cv_uri: dataCubeUri + "dataStructureDefinition",
                __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "dataStructureDefinition") + "",
                
                // type
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                    "http://purl.org/linked-data/cube#DataStructureDefinition",
                
                // components
                "http://purl.org/linked-data/cube#component": {
                    0: dataCubeUri + "measure"
                },          
                
                // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
                "http://purl.org/dc/terms/created": (new Date()).toString()       
            }},
            i:number = 1;
        
        // add all dimensions to component relation
        _.each(dimensions, function(dimension){
            
            dsd [0]["http://purl.org/linked-data/cube#component"][i] = 
                dimension.__cv_uri;
            
            ++i;
        });
        
        return dsd;
    }
    
    /**
     *
     */
    static buildDimensionElements(dataCubeUri:string, clusters:number[][], dimensionType:string) : any 
    {
        var dimensionElements:any = {},
            j:number = 0;
        
        /**
         * cluster dimension contains all available and non-empty clusters as 
         * their dimension elements
         */
        if ("cluster" == dimensionType) {
            _.each (clusters, function(cluster){
                
                // ignore empty clusters
                if (0 === _.size(cluster)){
                    return;
                }
                
                dimensionElements [j] = {
                    
                    // label
                    __cv_niceLabel: "Cluster "+ j,
                    "http://www.w3.org/2000/01/rdf-schema#label": "Cluster "+ j,
                    
                    // uri
                    __cv_uri: dataCubeUri + "cluster" + j,
                    __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "cluster" + j)+"",
                    
                    // type
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                        dataCubeUri + "clusterDimension"
                };
                
                ++j;
            });
            
        /**
         * position dimension contains all used positions between 1 and n, but
         * it will add custom dimensions elements such as first(1) to make it
         * easier later on to play around with the data, for instance see cluster
         * borders
         */
        } else if ("position" == dimensionType){
            
            var sortedClusters:any = $.parseJSON(JSON.stringify(clusters));
            
            // sort clusters by their size descending
            sortedClusters.sort(function(a,b){
                return _.size(a) < _.size(b);
            });
            
            var label:string = "",
                usedPositions:string[] = [];
            
            /**
             * 
             */
            _.each(sortedClusters, function(cluster, clusterIndex){
                
                if (0 == _.size(cluster)) 
                    return;
                
                _.each(cluster, function(number, position){
                    
                    // Position: 0 (first)
                    if (0 == position && -1 === $.inArray(position+" (first)", usedPositions)) {                          
                        // 
                        label = "0 (first)";
                        usedPositions.push (label);            
                        dimensionElements [j] =  {  
                            
                            // label
                            __cv_niceLabel: label,
                            "http://www.w3.org/2000/01/rdf-schema#label": label,
                                              
                            // uri
                            __cv_uri: dataCubeUri + "position" + j,
                            __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "position" + j)+"",
                            
                            // type
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                                dataCubeUri + "positionDimension"
                        };
                        ++j;
                    
                    // Position: x + (last)
                    } else if (_.size(cluster) == (position+1) 
                               && -1 === $.inArray(position+" (last)", usedPositions)) {
                                   
                        label = position + " (last)";
                        usedPositions.push (label);
                        dimensionElements [j] =  {  
                            
                            // label
                            __cv_niceLabel: label,
                            "http://www.w3.org/2000/01/rdf-schema#label": label,
                                              
                            // uri
                            __cv_uri: dataCubeUri + "position" + j,
                            __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "position" + j)+"",
                            
                            // type
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                                dataCubeUri + "positionDimension"
                        };
                        ++j;
                    
                    // Position: x    
                    } else if (0 < position 
                               && -1 === $.inArray(position+"", usedPositions)) {
                        
                        label = position + "";
                        usedPositions.push (label);
                        dimensionElements [j] =  {  
                            
                            // label
                            __cv_niceLabel: label,
                            "http://www.w3.org/2000/01/rdf-schema#label": label,
                                              
                            // uri
                            __cv_uri: dataCubeUri + "position" + j,
                            __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "position" + j)+"",
                            
                            // type
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                                dataCubeUri + "positionDimension"
                        };
                        ++j;
                    
                    // still used
                    } else {}
                    
                });
            });
        }
        
        return dimensionElements;
    }
    
    /**
     * 
     */
    static buildDimensionsAndTheirComponentSpecifications(dataCubeUri:string, clusters:number[][]) : any
    {
        var clusterDimensionUri:string = dataCubeUri + "componentSpecificationClusterDimension",
            dimensions:any = {},
            positionDimensionUri:string = dataCubeUri + "componentSpecificationPositionDimension";
            
        /**
         * dimension: cluster
         */
        dimensions[clusterDimensionUri] = {
                    
            // label
            __cv_niceLabel: "Cluster Dimension",
            "http://www.w3.org/2000/01/rdf-schema#label": "Cluster Dimension",
            
            // describe
            __cv_description: "",
            
            // uri
            __cv_uri: clusterDimensionUri,
            __cv_hashedUri: CryptoJS.MD5(clusterDimensionUri) + "",
            
            // dimension elements
            __cv_elements: DataCube_ClusteringDataCube.buildDimensionElements (
                dataCubeUri, clusters, "cluster"
            ),
            
            // set relation to dimension itself
            "http://purl.org/linked-data/cube#dimension": 
                dataCubeUri + "clusterDimension",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",
                                
            // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
            "http://purl.org/dc/terms/created": (new Date()).toString()
        };
            
        /**
         * dimension: position in a cluster
         */
        dimensions[positionDimensionUri] = {
                
            // label
            __cv_niceLabel: "Position Dimension",
            "http://www.w3.org/2000/01/rdf-schema#label": "Position Dimension",
            
            // describe
            __cv_description: "",
            
            // uri
            __cv_uri: positionDimensionUri,
            __cv_hashedUri: CryptoJS.MD5(positionDimensionUri) + "",
            
            // dimension elements
            __cv_elements: DataCube_ClusteringDataCube.buildDimensionElements (
                dataCubeUri, clusters, "position"
            ),
            
            // set relation to dimension itself
            "http://purl.org/linked-data/cube#dimension": 
                dataCubeUri + "positionDimension",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",
                                
            // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
            "http://purl.org/dc/terms/created": (new Date()).toString()
        };
        
        return dimensions;
    }
    
    /**
     *
     */
    static buildMeasures(dataCubeUri:string) : any
    {
        return { 0: {
            // label
            __cv_niceLabel: "Artifical Measure",
            "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure",
            
            // describe
            __cv_description: "",                              
            
            // uri
            __cv_uri: dataCubeUri + "componentSpecificationMeasure",
            __cv_hashedUri: CryptoJS.MD5(dataCubeUri + "componentSpecificationMeasure") + "",
            
            // relation to measure property
            "http://purl.org/linked-data/cube#measure": dataCubeUri + "measure",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",

            // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
            "http://purl.org/dc/terms/created": (new Date()).toString()
        }};
    }
    
    /**
     *
     */
    static buildObservations(dataCubeUri:string, clusters:number[][]) : any
    {
        var i:number = 0,
            j:number = 0,
            observations:any = {},
            sortedClusters:any = $.parseJSON(JSON.stringify(clusters));
            
        // sort clusters by their size descending
        sortedClusters.sort(function(a,b){
            return _.size(a) < _.size(b);
        });
        
        // go through all clusters
        _.each (sortedClusters, function(cluster, clusterIndex){
            
            // ignore empty clusters
            if (0 === _.size(cluster)){
                return;
            }
            
            // go through all numbers of a certain cluster
            _.each (cluster, function(number, position){
                
                // built observation body
                observations[i] = {
                    
                    // label
                    __cv_niceLabel: "Observation of cluster " + j,
                    "http://www.w3.org/2000/01/rdf-schema#label": "Observation of cluster " + j,
                    
                    // uri
                    __cv_uri: dataCubeUri + "observation" + i,
                    __cv_hashedUri: "c204871025866c6178c363948246c146",
                    
                    __cv_description: "",
                    
                    "http://purl.org/linked-data/cube#dataSet": dataCubeUri + "dataset",
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#Observation"
                };
                
                // measure
                observations[i][dataCubeUri + "measure"] = number;
                
                // cluster dimension
                observations[i][dataCubeUri + "clusterDimension"] = dataCubeUri + "cluster" + j;
                
                // position dimension
                observations[i][dataCubeUri + "positionDimension"] = 
                    DataCube_ClusteringDataCube.getPositionDimensionElement(
                        dataCubeUri, clusters, clusterIndex, position, number
                    );
                
                ++i;
            });     
            
            ++j;       
        });
        
        return observations;        
    }
    
    /**
     *
     */
    static create(clusters:number[][], backendUrl:string, numberOfClusters:number) 
    {
        var clusteringDataCube = DataCube_DataCubeMerger.getDefaultDataCubeObject(),
            dataCubeUri:string = "";
        
        // uri
        dataCubeUri = DataCube_DataCubeMerger.generateMergedDataCubeUri(
            backendUrl, JSON.stringify(clusters)
        );
        
        
        /**
         * set datasets
         */
        clusteringDataCube.dataSets = DataCube_ClusteringDataCube.buildDataSets(
            dataCubeUri, clusters, numberOfClusters
        );
        clusteringDataCube.selectedDS = clusteringDataCube.dataSets[0];
        
        
        /**
         * set equal dimension pair(s) as dimensions
         */
        clusteringDataCube.components.dimensions = DataCube_ClusteringDataCube.buildDimensionsAndTheirComponentSpecifications(
            dataCubeUri, clusters
        );
        
        clusteringDataCube.selectedComponents.dimensions = clusteringDataCube.components.dimensions;
        
        
        /**
         * set measure
         */        
        clusteringDataCube.components.measures = DataCube_ClusteringDataCube.buildMeasures(
            dataCubeUri
        );
                
        clusteringDataCube.selectedComponents.measure = clusteringDataCube.components.measures [0];
        
        
        /**
         * set data structure definitions
         */
        clusteringDataCube.dataStructureDefinitions = DataCube_ClusteringDataCube.buildDataStructureDefinitions(
            dataCubeUri, clusteringDataCube.selectedComponents.dimensions
        );
        
        
        /**
         * set observations
         */
        clusteringDataCube.retrievedObservations = DataCube_ClusteringDataCube.buildObservations(
            dataCubeUri, clusters
        );
        
        clusteringDataCube.selectedDSD = clusteringDataCube.dataStructureDefinitions[0];
        
        return clusteringDataCube;
    }
    
    /**
     *
     */
    static getPositionDimensionElement(dataCubeUri:string, clusters:number[][], 
        clusterIndexToUse:number, positionToUse:number, numberToCheck:number) : string
    {
        var dimensionElementToSearch:string = "",
            j:number = 0,
            label:string = "",
            sortedClusters:any = $.parseJSON(JSON.stringify(clusters)),
            uri:string = "",
            usedPositions:string[] = [];
            
        // sort clusters by their size descending
        sortedClusters.sort(function(a,b){
            return _.size(a) < _.size(b);
        });
        
        if (0 == positionToUse) {
            return dataCubeUri + "position0";
        }
        
        /**
         * 
         */
        _.each(sortedClusters, function(cluster, clusterIndex){
            
            if (0 == _.size(cluster)) 
                return;
            
            _.each(cluster, function(number, position){
                
                uri = "";
                
                // Position: 0 (first)
                if (0 == position && -1 === $.inArray(position+" (first)", usedPositions)) {
                    usedPositions.push ("0 (first)");            
                    uri = dataCubeUri + "position" + j;
                    ++j;
                
                // Position: x + (last)
                } else if (_.size(cluster) == (position+1) 
                           && -1 === $.inArray(position+" (last)", usedPositions)) {
                               
                    usedPositions.push (position + " (last)");
                    uri = dataCubeUri + "position" + j;
                    ++j;
                
                // Position: x    
                } else if (0 < position && -1 === $.inArray(position+"", usedPositions)) {
                    
                    usedPositions.push (position + "");
                    uri = dataCubeUri + "position" + j;
                    ++j;
                
                // still used
                } else {}
                
                if (clusterIndexToUse == clusterIndex && number == numberToCheck) {
                    
                    // if in this round there was no new position added
                    if (true === _.str.isBlank(uri)) {
                        
                        dimensionElementToSearch = dataCubeUri + "position" 
                            + $.inArray(position+"", usedPositions);
                        
                    // use the position which was added this round
                    } else {
                        dimensionElementToSearch = uri;
                    }
                }
            });
        });
        
        return dimensionElementToSearch;
    }
}

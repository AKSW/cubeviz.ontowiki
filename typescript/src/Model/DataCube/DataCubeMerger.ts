/**
 * Its main purpose is to generate an artifical data cube
 */
class DataCube_DataCubeMerger
{    
    /**
     * Adapt given dimension elements and give them new uris.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param dimensionElements any Dimension elements to adapt
     * @param i number Index of the dimension the dimension elements are related to
     * @return any Object with numerical keys and its properties are adapted dimension elements
     */
    static adaptDimensionElements(mergedDataCubeUri:string, dimensionElements:any,
        i:number) : any
    {
        var j:number = 0;
        
        _.each(dimensionElements, function(element){
            
            // update rdf:type and set it to dimension+i
            // example:
            //      set it from
            //          http://example.cubeviz.org/compare/populationEurope/year
            //      to
            //          http://localhost/ontowiki/d2540aaacf6da8db3a95273a4a0d81bf/dimension1
            element["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] = 
                mergedDataCubeUri 
                + "dimension" 
                + i;
                
            // set origin source
            element["http://purl.org/dc/terms/source"] = element.__cv_uri;
            
            // set sameAs relation to original dimension element
            if (false === _.isUndefined(element["http://www.w3.org/2002/07/owl#sameAs"])) {
                element["http://www.w3.org/2002/07/owl#sameAs"] = [
                    element["http://www.w3.org/2002/07/owl#sameAs"],
                    element.__cv_uri
                ];
            } else {
                element["http://www.w3.org/2002/07/owl#sameAs"] = element.__cv_uri;
            }
            
            // update dimension element uri
            element.__cv_uri = mergedDataCubeUri 
                + "dimension" + i
                + "dimensionElement" + j;
            
            element.__cv_hashedUri = CryptoJS.MD5(element.__cv_uri) + "";
                               
            ++j;
        });
        
        return dimensionElements;
    }
    
    /**
     * Build a new dataset out of two others. The new one has its own uri's, but
     * will have relations (dct:source) to its origin.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param datasetLabel1 string Label of dataset 1
     * @param datasetLabel2 string Label of dataset 2
     * @param datasetUri1 string Uri of dataset 1
     * @param datasetUri2 string Uri of dataset 2
     * @return any Object containing another one with dataset information
     */
    static buildDataSets(mergedDataCubeUri:string, datasetLabel1:string, 
        datasetLabel2:string, datasetUri1:string, datasetUri2:string) : any 
    {
        return { 0: {
            
            // label
            __cv_niceLabel: "Artifical Dataset",
            "http://www.w3.org/2000/01/rdf-schema#label": "Merged DataSet",
            
            // describe
            __cv_description: "This is an artifical data set and it consists of '"
                + datasetLabel1
                + "' and '"
                + datasetLabel2
                + "'",                              
            
            // uri and hashed uri
            __cv_uri: mergedDataCubeUri + "dataset",            
            __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "dataset") + "",
            
            // add relation to the two origin datasets
            "http://purl.org/dc/terms/source": [ 
                datasetUri1,
                datasetUri2
            ],
            
            // add relation to data structure definition
            "http://purl.org/linked-data/cube#structure": mergedDataCubeUri + "dataStructureDefinition",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataSet"
        }};
    }
    
    /**
     * Build data structure definition for merged data cube. It has new qb:component
     * relations to generated dimensions and measure.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param dimensions any Generated dimensions of merged data cube
     * @return any Object containing another one with data structure definition
     */
    static buildDataStructureDefinitions(mergedDataCubeUri:string, dimensions:any) : any 
    {
        var dsd:any = { 0: {
            
                // label
                __cv_niceLabel: "Artifical Data Structure Definition",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Data Structure Definition",
                
                // describe
                __cv_description: "This is an artifical data structure definition "
                    + "created during a data cube merge.",
                
                // uri and hashed uri
                __cv_uri: mergedDataCubeUri + "dataStructureDefinition",
                __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "dataStructureDefinition") + "",
                
                // type
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                    "http://purl.org/linked-data/cube#DataStructureDefinition",
                
                // components
                "http://purl.org/linked-data/cube#component": {
                    0: mergedDataCubeUri + "measure"
                }
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
     * Build component specifications and related dimension elements.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param equalDimensions any[] List of equal dimension pairs
     * @return any Object with numeric keys which contains built component specifications 
     *             and dimension elements
     */
    static buildDimensionsAndTheirComponentSpecifications(mergedDataCubeUri:string, 
        equalDimensions:any[]) : any
    {
        var componentSpecification:any = {},
            i:number = 0,
            virtualDimensions:any = {};
            
        console.log("");
        console.log("buildDimensionsAndTheirComponentSpecifications");
        console.log("");
        console.log("equalDimensions");
        console.log(equalDimensions);
        
        // go through all equal dimensions and add their uri
        _.each (equalDimensions, function(dimensionPair){
            
            componentSpecification = {
                
                // label
                __cv_niceLabel: "Merged Component Specification of '"
                    + dimensionPair[0].__cv_niceLabel
                    + "' and '"
                    + dimensionPair[1].__cv_niceLabel
                    + "'",
                "http://www.w3.org/2000/01/rdf-schema#label": "Merged Component Specification of '"
                    + dimensionPair[0].__cv_niceLabel
                    + "' and '"
                    + dimensionPair[1].__cv_niceLabel
                    + "'",
                
                // describe
                __cv_description: "This Component Specification was merged and consists of '"
                    + dimensionPair[0].__cv_niceLabel
                    + "' and '"
                    + dimensionPair[1].__cv_niceLabel
                    + "'",
                
                // uri
                __cv_uri: mergedDataCubeUri + "componentSpecificationDimension" + i,
                __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "componentSpecificationDimension" + i) + "",
                
                // sameAs relations to both component specifications of dimension pair
                "http://www.w3.org/2002/07/owl#sameAs": [
                    dimensionPair[0].__cv_uri, dimensionPair[1].__cv_uri
                ],
                
                // add relation to the two origin datasets
                "http://purl.org/dc/terms/source": [ 
                    dimensionPair[0].__cv_uri, dimensionPair[1].__cv_uri
                ],
                
                // dimension elements
                __cv_elements: {},
                
                // remember old qb:measure relation object
                __cv_oldCubeDimension: [
                    dimensionPair[0]["http://purl.org/linked-data/cube#dimension"],
                    dimensionPair[1]["http://purl.org/linked-data/cube#dimension"]
                ],
                
                // set relation to dimension itself
                "http://purl.org/linked-data/cube#dimension": 
                    mergedDataCubeUri + "dimension" + i,
                
                // type
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                    "http://purl.org/linked-data/cube#ComponentSpecification"
            };
            
            // set dimension elements
            componentSpecification.__cv_elements = DataCube_DataCubeMerger.mergeDimensionElements (
                dimensionPair[0].__cv_elements, dimensionPair[1].__cv_elements
            );
                  
            componentSpecification.__cv_elements = DataCube_DataCubeMerger.adaptDimensionElements (
                mergedDataCubeUri, componentSpecification.__cv_elements, i
            );
            
            console.log("");
            console.log("new component specification:");
            console.log(componentSpecification);
            
            // save adapted
            virtualDimensions[componentSpecification.__cv_uri] = componentSpecification;
            
            ++i;
        });
        
        return virtualDimensions;
    }
   
    /**
     * Generates a new artifical measure using merged data cube uri.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param measure1 any
     * @param measure2 any
     * @return any Object with one element representing new measure
     */
    static buildMeasure(mergedDataCubeUri:string, measure1:any, measure2:any) : any 
    {
        return { 0: {
            
            // label
            __cv_niceLabel: "Artifical Measure",
            "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure",
            
            // describe
            __cv_description: "This is an artifical measure and it consists of '"
                + measure1.__cv_niceLabel
                + "' and '"
                + measure2.__cv_niceLabel
                + "'",                              
            
            // uri
            __cv_uri: mergedDataCubeUri + "componentSpecificationMeasure",
            __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "componentSpecificationMeasure") + "",
            
            // remember old qb:measure relation object
            __cv_oldCubeMeasure: [
                measure1 ["http://purl.org/linked-data/cube#measure"],
                measure2 ["http://purl.org/linked-data/cube#measure"]
            ],
            
            // relation to measure property
            "http://purl.org/linked-data/cube#measure": mergedDataCubeUri + "measure",
            
            // relation to origin measures
            "http://purl.org/dc/terms/source": [
                measure1.__cv_uri, 
                measure2.__cv_uri
            ],
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",
        }};
    }
    
    /**
     * Adapts observations and updates a couple of their relations, in case
     * that exactly one dimension pair was found.
     * @param mergedDataCubeUri string
     * @param observations1 any
     * @param observations2 any
     * @param measure any
     * @param dimensions any
     * @param i number
     * @return any
     */
    static buildObservations(mergedDataCubeUri:string, observations1:any, 
        observations2:any, measure:any, dimensions:any, dimensionIndex:number) : any
    {        
        var adaptedObservations:any = {},
            adaptedDimensionElementUri:string = null,
            i:number = _.size(observations1),
            mergedObservations:any = {},
            tmp:any = {};
            
        console.log("");
        
        
        check http://data.lod2.eu/scoreboard/items/i_iuse/RF_GE1/_ind/EuropeanUnion-27countries/2011/ind
        
        
        
        console.log("buildObservationsAccordingToEqualDimensionPair");
        
        // create a real clone of retrieved observations lists
        mergedObservations = $.parseJSON(JSON.stringify(observations1));
        observations2 = $.parseJSON(JSON.stringify(observations2));
        
        _.each(observations2, function(observation){
            mergedObservations [i++] = observation;
        });
        
        i = 0;
        
        _.each(mergedObservations, function(observation){
            
            // remember old uri using a sameAs and dct:source relation
            observation ["http://www.w3.org/2002/07/owl#sameAs"] = observation.__cv_uri;
            observation ["http://purl.org/dc/terms/source"] = observation.__cv_uri;
            
            
            // update uri
            observation.__cv_uri = mergedDataCubeUri + "observation" + i;
            observation.__cv_hashedUri = CryptoJS.MD5 (mergedDataCubeUri + "observation" + i) + "";
            
            
            // update relation to dataset
            observation ["http://purl.org/linked-data/cube#dataSet"] =
                mergedDataCubeUri + "dataset";
            
            
            // update relation to measure
            observation [mergedDataCubeUri + "measure"] = observation [measure.__cv_oldCubeMeasure[0]];
            delete observation [measure.__cv_oldCubeMeasure[0]];
            
            
            // update observation
            adaptedObservations [i++] = observation;
        });
        
        /**
         * for each merged dimension go through all observations
         */
        _.each(dimensions, function(dimension){
            i = 0;            
            _.each(adaptedObservations, function(observation){
                
                // replace relation to dimension
                adaptedDimensionElementUri = null;
                _.each (dimension.__cv_elements, function(element){
                    
                    if (element["http://www.w3.org/2002/07/owl#sameAs"] == observation [dimension.__cv_oldCubeDimension[0]]) {
                        adaptedDimensionElementUri = element.__cv_uri;
                        observation [mergedDataCubeUri + "dimension" + dimensionIndex] = adaptedDimensionElementUri;                    
                        delete observation [dimension.__cv_oldCubeDimension[0]];
                    }
                });
                    
                adaptedObservations[i++] = observation;
            });
            
            ++dimensionIndex;
        });
        
        return adaptedObservations;
    }
    
    /**
     * Generates a new and dereferenceable uri of a data cube
     * @param url string URL this system is running on
     * @param stringifiedObject string Stringified compareAction object
     * @return string New merged data cube uri
     */
    static generateMergedDataCubeUri(url:string, stringifiedObject:string) : string
    {
        return url 
               + "go/mergeddatacube/" 
               + CryptoJS.MD5(stringifiedObject)
               + "#";
    }
    
    /**
     * Returns the basic structure of a data cube.
     * @return any Object with basic data cube structure
     */
    static getDefaultDataCubeObject() : any
    {
        return {
            components: {
                attributes: null,
                dimensions: {},
                measures: {}
            },
            dataSets: {},
            dataStructureDefinitions: {},
            numberOfMultipleDimensions: 0,
            numberOfOneElementDimensions: 0,
            retrievedObservations: {},
            selectedComponents: {},
            selectedDS: {},
            selectedDSD: {},
            selectedSlice: {},
            slices: {}
        };
    }
    
    /**
     * Returns an adapted dimensions list but each has only a couple of dimension
     * elements in it, these are the selected dimension elements.
     * @param dimensions any Object with numeric keys containing dimensions
     * @return any Same object structure as dimensions, but with adapted dimensionElements
     *             list
     */
    static getSelectedDimensionElements(dimensions:any) : any
    {
        var numberOfDimensionElementsToUse:number = Math.floor((Math.random()*5)+1),
            selectedComponentDimensions:any = {};
        
        dimensions = $.parseJSON(JSON.stringify(dimensions));
        
        // go through all dimensions
        _.each (dimensions, function(dimension){
            
            // if there are less than the random number of dimension elements
            // to use, use only one dimension element
            if (numberOfDimensionElementsToUse > dimension.__cv_elements) {
                dimension.__cv_elements = dimension.__cv_elements[0];
            
            // otherwise use as much elements as random number
            } else {
                var i:number = 0,
                    selectedDimensionElements:any = {};
                
                _.each(dimension.__cv_elements, function(element){
                    if (i <= numberOfDimensionElementsToUse) {
                        selectedDimensionElements[i] = element;
                        ++i;
                    }
                });
                
                dimension.__cv_elements = selectedDimensionElements
            }
            
            // save dimension
            selectedComponentDimensions [dimension.__cv_uri] = dimension;
        });
        
        return selectedComponentDimensions;
    }
    
    /**
     * Merges two objects containing dimension elements. It throws away doubled
     * dimension elements. The dimension elements are the same, if they have the
     * same URI or share a sameAs-relation.
     * @param dimensionElements1 any Object containing a list of dimension elements of dataset1
     * @param dimensionElements2 any Object containing a list of dimension elements of dataset2
     * @return any Object containing only distinct dimension elements
     */
    static mergeDimensionElements(dimensionElements1:any, dimensionElements2:any) : any
    {
        var i = 0,
            mergedDimensionElements:any = {},
            usedElementUris:string[] = [];
        
        // from dataset 1
        _.each (dimensionElements1, function(element){
            
            // simply add element
            mergedDimensionElements[i++] = element;
            
            // CubeViz assumes that all elements are unique
            usedElementUris.push (element.__cv_uri);
            
            if (false === _.isUndefined(element["http://www.w3.org/2002/07/owl#sameAs"])) {
                usedElementUris.push (element["http://www.w3.org/2002/07/owl#sameAs"]);
            }
        });        
        
        // from dataset 2
        _.each (dimensionElements2, function (element){

            // only add element of the other dataset's dimension, if its URI
            // was not used before
            if (-1 == $.inArray (element.__cv_uri, usedElementUris)) {
                
                if (false === _.isUndefined(element["http://www.w3.org/2002/07/owl#sameAs"])
                    && -1 < $.inArray (element["http://www.w3.org/2002/07/owl#sameAs"], usedElementUris)) {
                    return;
                }
                
                mergedDimensionElements[i++] = element;
                
                usedElementUris.push (element.__cv_uri);
            }
        });
        
        return mergedDimensionElements;
    }
}

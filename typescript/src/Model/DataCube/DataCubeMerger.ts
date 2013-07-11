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
     * Generates a new artifical measure using merged data cube uri.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param measureUri1 string URI of Measure1
     * @param measureUri2 string URI of Measure2
     * @param measureLabel1 string Label of Measure1
     * @param measureLabel2 string Label of Measure2
     * @return any Object with one element representing new measure
     */
    static buildMeasure(mergedDataCubeUri:string, measureUri1:string, measureUri2:string,
        measureLabel1:string, measureLabel2:string) : any 
    {
        return { 0: {
            
            // label
            __cv_niceLabel: "Artifical Measure",
            "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure",
            
            // describe
            __cv_description: "This is an artifical measure and it consists of '"
                + measureLabel1
                + "' and '"
                + measureLabel2
                + "'",                              
            
            // uri
            __cv_uri: mergedDataCubeUri + "componentSpecificationMeasure",
            __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "componentSpecificationMeasure") + "",
            
            // relation to measure property
            "http://purl.org/linked-data/cube#measure": mergedDataCubeUri + "measure",
            
            // relation to origin measures
            "http://purl.org/dc/terms/source": [measureUri1, measureUri2],
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",
        }};
    }
    
    /**
     *
     */
    static buildRetrievedObservations(mergedDataCubeUri:string, retrievedObservations:any) : any
    {
        // create a real clone of retrieved observations list
        retrievedObservations = $.parseJSON(JSON.stringify(retrievedObservations));
        
        var adaptedObservations:any = {},
            i:number = 0;
            
        retrievedObservations = retrievedObservations[1].concat (retrievedObservations[2]);
        
        // go through all retrieved observations
        _.each(retrievedObservations, function(observation){
            
            // update relation to dataset
            observation ["http://purl.org/linked-data/cube#dataSet"] =
                mergedDataCubeUri + "dataset";
                
            adaptedObservations[i++] = observation;
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
     * @param equalDimensions any[] List of dimension pairs, a pair consists of 
     *                              equal dimensions
     */
    static getSingleDimensions(equalDimensions:any[]) : any 
    {
        var dimensions:any = {},
            i:number = 0;
        
        _.each(equalDimensions, function(dimensionPair){
            dimensions[i++] = dimensionPair[0];
            dimensions[i++] = dimensionPair[1];
        });
        
        return dimensions;
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

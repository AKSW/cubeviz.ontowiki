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
                + "DimensionElement" + j;
            
            element.__cv_hashedUri = CryptoJS.MD5(element.__cv_uri) + "";
                               
            ++j;
        });
        
        return dimensionElements;
    }
    
    /**
     * Build a new dataset out of two others. The new one has its own uri's, but
     * will have relations (dct:source) to its origin.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param dataset1 any Dataset 1
     * @param dataset2 any Dataset 2
     * @return any Object containing another one with dataset information
     */
    static buildDataSets(mergedDataCubeUri:string, dataset1:any, dataset2:any) : any 
    {
        return { 0: {
            
            // label
            __cv_niceLabel: "Artifical Dataset",
            "http://www.w3.org/2000/01/rdf-schema#label": "Merged DataSet",
            
            // describe
            __cv_description: "This is an artifical data set and it consists of '"
                + dataset1.__cv_niceLabel
                + "' and '"
                + dataset2.__cv_niceLabel
                + "'",                              
            
            // uri and hashed uri
            __cv_uri: mergedDataCubeUri + "dataset",            
            __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "dataset") + "",
            
            // add relation to the two origin datasets
            "http://purl.org/dc/terms/source": [ 
                dataset1.__cv_uri, dataset2.__cv_uri
            ],
            
            // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
            "http://purl.org/dc/terms/created": (new Date()).toString(),
            
            // add relation to data structure definition
            "http://purl.org/linked-data/cube#structure": mergedDataCubeUri + "dataStructureDefinition",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataSet",
            
            /**
             * attach source datasets 
             */
            __cv_sourceDataset: [dataset1, dataset2]
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
                    "http://purl.org/linked-data/cube#ComponentSpecification",
                                    
                // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
                "http://purl.org/dc/terms/created": (new Date()).toString(),
                
                // add source component speficiations
                __cv_sourceComponentSpecification: [
                    dimensionPair[0], dimensionPair[1]
                ]
            };
            
            // set dimension elements
            componentSpecification.__cv_elements = DataCube_DataCubeMerger.mergeDimensionElements (
                dimensionPair[0].__cv_elements, dimensionPair[1].__cv_elements
            );
                  
            componentSpecification.__cv_elements = DataCube_DataCubeMerger.adaptDimensionElements (
                mergedDataCubeUri, componentSpecification.__cv_elements, i
            );
            
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
            __cv_niceLabel: "Artifical Measure of '"
                + measure1.__cv_niceLabel
                + "' and '"
                + measure2.__cv_niceLabel
                + "'",
            "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure of '"
                + measure1.__cv_niceLabel
                + "' and '"
                + measure2.__cv_niceLabel
                + "'",
            
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
                measure1.__cv_uri, measure2.__cv_uri
            ],
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",

            // set create time and date (example: Fri Jul 19 2013 14:00:38 GMT+0200 (CEST))
            "http://purl.org/dc/terms/created": (new Date()).toString(),
            
            // add source measures
            __cv_sourceMeasure: [measure1, measure2]
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
            observationCounter:number = 0,
            tmp:any = {},
            tmpObservations:any = {},
            urisToIgnore:any[] = [],
            usedUri:string = null;
            
        // create a real clone of retrieved observations lists
        observations1 = $.parseJSON(JSON.stringify(observations1));
        observations2 = $.parseJSON(JSON.stringify(observations2));
        
        _.each(observations1, function(observation){
            tmpObservations [observation.__cv_uri] = observation;
        });
        
        _.each(observations2, function(observation){
            tmpObservations [observation.__cv_uri] = observation;
        });
        
        _.each(tmpObservations, function(observation){
            
            // remember old uri using a sameAs and dct:source relation
            observation ["http://www.w3.org/2002/07/owl#sameAs"] = observation.__cv_uri;
            observation ["http://purl.org/dc/terms/source"] = observation.__cv_uri;
            
            
            // update uri
            observation.__cv_uri = mergedDataCubeUri + "observation" + observationCounter;
            observation.__cv_hashedUri = CryptoJS.MD5 (observation.__cv_uri) + "";
            
            
            // update relation to dataset
            observation ["http://purl.org/linked-data/cube#dataSet"] =
                mergedDataCubeUri + "dataset";
            
            
            // update relation to measure
            usedUri = null;
            
            _.each(measure.__cv_oldCubeMeasure, function(oldMeasureUri){
                if (false === _.isUndefined(observation [oldMeasureUri])) {
                    usedUri = oldMeasureUri;
                }
            });
            
            if (false === _.isNull(usedUri)) {                
                // update observation
                observation [mergedDataCubeUri + "measure"] = observation[usedUri];
                delete observation[usedUri];
                
                adaptedObservations [observation.__cv_uri] = observation;
                ++observationCounter;
            } else {
                // In this case the current observation has no valid value.
            }
        });
        
        /**
         * for each merged dimension go through all observations
         */
        tmpObservations = {};
        _.each(dimensions, function(dimension){
            
            // i = 0;            
            _.each(adaptedObservations, function(observation){
                
                // replace relation to dimension
                adaptedDimensionElementUri = null;
                _.each (dimension.__cv_elements, function(element){
                    
                    if (true === _.isArray(element["http://www.w3.org/2002/07/owl#sameAs"])) {
                        
                        /**
                         * Find the origin uri of the current element by using
                         * sameAs array containing all origin uris of element.
                         * To do so, you go through each observation and check,
                         * if there is a non-undefined field with current observation
                         * and the current dimension. This field points to a 
                         * certain dimension element. But this dimension element 
                         * was changed before by DataCubeMerger.adaptedDimensionElements.
                         * So you have to replace this reference with the updated
                         * one.
                           
                           Example observation (not updated):
                           **********************************
                         
                            __cv_description: ""
                            __cv_hashedUri: "be9cff7063b05973c289b367c93a779d"
                            __cv_niceLabel: 
                                "Availability of eGovernment services - enterprises for Finland in 2001"
                            __cv_uri: 
                                "http://data.lod2.eu/scoreboard/items/FOA_ent/Country/_of_pub_serv_for_ent/Finland/2001/ind"
                            http://data.lod2.eu/scoreboard/properties/country:  
                                "http://data.lod2.eu/scoreboard/country/Finland"
                            http://data.lod2.eu/scoreboard/properties/unit:  
                                "%_of_pub_serv_for_ent"
                            http://data.lod2.eu/scoreboard/properties/value:  
                                "0.625"
                            http://data.lod2.eu/scoreboard/properties/year:  
                                "http://data.lod2.eu/scoreboard/year/2001"
                            http://purl.org/linked-data/cube#dataSet:  
                                "http://data.lod2.eu/scoreboard/ds/indicator/FOA_ent_Country__of_pub_serv_for_ent"
                            http://www.w3.org/1999/02/22-rdf-syntax-ns#type:  
                                "http://purl.org/linked-data/cube#Observation"
                            http://www.w3.org/2000/01/rdf-schema#label:  
                                "Availability of eGovernment services - enterprises for Finland in 2001"
                         
                           This example observation is an original one, which means
                           that there are no modifications yet. As you can see,
                           its used dimensions are:
                                http://data.lod2.eu/scoreboard/properties/country and
                                http://data.lod2.eu/scoreboard/properties/year
                                
                           The uris of these two dimensions were updated by 
                           DataCubeMerger.buildDimensionsAndTheirComponentSpecifications
                           before. So we have to adapted this property. The
                           same goes for the dimension element on which the relation
                           points to.
                           
                           Example Dimension Element:
                           **************************
                             __cv_description: ""
                             __cv_hashedUri: "2c432b80c03e04181cbbdf1fe9bf1837"
                             __cv_niceLabel: "Hungary"
                             __cv_uri: 
                                "http://localhost/ow_cubeviz_comparing/cubeviz/go/mergeddatacube/ee8a5d9bd49388bb4454fd4bff52ee4d#dimension0DimensionElement2"
                             http://ns.aksw.org/spatialHierarchy/isLocatedIn: 
                                "http://data.lod2.eu/scoreboard/country/European+Union+-+27+countries"
                             http://purl.org/dc/terms/source: "http://data.lod2.eu/scoreboard/country/Hungary"
                             http://www.w3.org/1999/02/22-rdf-syntax-ns#type: 
                                "http://localhost/ow_cubeviz_comparing/cubeviz/go/mergeddatacube/ee8a5d9bd49388bb4454fd4bff52ee4d#dimension0"
                             http://www.w3.org/2000/01/rdf-schema#label: "Hungary"
                             http://www.w3.org/2002/07/owl#sameAs: 
                                "http://data.lod2.eu/scoreboard/country/Hungary"
                           
                           As you can see, it has the property owl:sameAs which 
                           refers to the country Hungary. Thats the origin uri
                           of this dimension element. After we found a match for
                           the dimension, we use new __cv_uri of dimension element which
                           was previously generated by DataCubeMerger.adaptedDimensionElements.
                           
                           Usally this generated uri ends with something like:
                           
                             .../mergeddatacube/ee8a5d9bd49388bb4454fd4bff52ee4d#dimension0:
                                .../mergeddatacube/ee8a5d9bd49388bb4454fd4bff52ee4d#dimension0DimensionElement2
                         */
                         _.each(element["http://www.w3.org/2002/07/owl#sameAs"], function(sameAsObject){
                            _.each(dimension.__cv_oldCubeDimension, function(oldDimensionUri){                                
                                if (sameAsObject == observation [oldDimensionUri]) {
                                    adaptedDimensionElementUri = element.__cv_uri;
                                }
                            });
                        });
                    } else {
                        _.each(dimension.__cv_oldCubeDimension, function(oldDimensionUri){
                            if (element["http://www.w3.org/2002/07/owl#sameAs"] == observation [oldDimensionUri]) {
                                adaptedDimensionElementUri = element.__cv_uri;
                            }
                        });
                    }
                });
                
                if (false === _.isNull(adaptedDimensionElementUri)) {
                    observation [mergedDataCubeUri + "dimension" + dimensionIndex] = adaptedDimensionElementUri;                    
                    
                    _.each(dimension.__cv_oldCubeDimension, function(oldDimensionUri){
                        delete observation [oldDimensionUri];
                    });
                    
                    tmpObservations[observation.__cv_uri] = observation;
                } else {
                    // In this case, there is an observation which points to a dimension
                    // element which does not exist. That usally means, that this
                    // observation is invalid but there could be another explanation. 
                    // But CubeViz is not able to handle this yet, so it will igonre 
                    // such observations
                    urisToIgnore.push(observation.__cv_uri);
                }
            });
            
            ++dimensionIndex;
        });
        
        adaptedObservations = {};
        
        // go through all tempary observations and collect all, which are not 
        // on the black list (urisToIgnore)
        _.each(tmpObservations, function(observation){
            if (-1 === $.inArray(observation.__cv_uri, urisToIgnore)) {
                adaptedObservations [observation.__cv_uri] = observation;
            }
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
               + (CryptoJS.MD5(stringifiedObject)+"").substring (0,6)
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

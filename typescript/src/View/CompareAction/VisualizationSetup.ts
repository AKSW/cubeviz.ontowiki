/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_VisualizationSetup extends CubeViz_View_Abstract 
{     
    private _equalDimensionsFound:bool = false;
    private _measuresReceived:bool = false;
    private _observationsReceived:bool = false;
       
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_VisualizationSetup", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onFound_equalDimensions",
                handler: this.onFound_equalDimensions
            },
            {
                name:    "onReceived_measures1AndMeasures2",
                handler: this.onReceived_measures1AndMeasures2
            },
            {
                name:    "onReceived_observations1AndObservations2",
                handler: this.onReceived_observations1AndObservations2
            },
            {
                name:    "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    
    /**
     * Adapt given dimension elements and set their uri's.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param dimensionElements
     * @return any
     */
    public adaptDimensionElements(mergedDataCubeUri:string, dimensionElements:any,
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
                               + "dimension" 
                               + i
                               + "dimensionElement"
                               + j;
            
            element.__cv_hashedUri = CryptoJS.MD5(element.__cv_uri) + "";
                               
            ++j;
        });
        
        return dimensionElements;
    }
    
    /**
     * Build merged dataset.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param datasetLabel1 string Label of dataset 1
     * @param datasetLabel2 string Label of dataset 2
     * @param datasetUri1 string Uri of dataset 1
     * @param datasetUri2 string Uri of dataset 2
     * @return any Object containing another one with dataset information
     */
    public buildDataSets(mergedDataCubeUri:string, datasetLabel1:string, 
        datasetLabel2:string, datasetUri1:string, datasetUri2:string) : any 
    {
        return { 0: {
            
            // label
            __cv_niceLabel: "Merged Dataset",
            "http://www.w3.org/2000/01/rdf-schema#label": "Merged DataSet",
            
            // describe
            __cv_description: "This dataset was merged and consists of data from '"
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
     * Build merged data structure definition.
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param dimensions any Virtual dimensions for merged data cube
     * @return any Object containing another one with data structure definition
     */
    public buildDataStructureDefinitions(mergedDataCubeUri:string, dimensions:any) : any 
    {
        var dsd:any = { 0: {
            
                // label
                __cv_niceLabel: "Artifical Data Structure Definition",
                "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Data Structure Definition",
                
                // describe
                __cv_description: "This is an artifical data structure definition " +
                                  "created during a data cube merge.",
                
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
     * @param mergedDataCubeUri string Generated uri of the merged data cube
     * @param equalDimensions any[] List of equal dimension pairs
     * @return any
     */
    public buildDimensionsAndTheirCs(mergedDataCubeUri:string, equalDimensions:any[]) : any
    {
        var componentSpecification:any = {},
            i:number = 0,
            self = this,
            virtualDimensions:any = {};
        
        // go through all equal dimensions and add their uri
        _.each (equalDimensions, function(dimensionPair){
            
            componentSpecification = {
                
                // label
                __cv_niceLabel: "Merged Component Specification",
                "http://www.w3.org/2000/01/rdf-schema#label": "Merged Component Specification",
                
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
                
                // set relation to dimension itself
                "http://purl.org/linked-data/cube#dimension": 
                    mergedDataCubeUri + "dimension" + i,
                
                // type
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                    "http://purl.org/linked-data/cube#ComponentSpecification"
            };
            
            // set dimension elements
            componentSpecification.__cv_elements = self.mergeDimensionElements (
                dimensionPair[0].__cv_elements, dimensionPair[1].__cv_elements
            );
                  
            componentSpecification.__cv_elements = self.adaptDimensionElements (
                mergedDataCubeUri,
                componentSpecification.__cv_elements,
                i
            );
            
            // save adapted
            virtualDimensions[i] = componentSpecification;
            
            ++i;
        });
        
        return virtualDimensions;
    }
    
    /**
     * mergedDataCubeUri string Generated uri of the merged data cube
     */
    public buildMeasure(mergedDataCubeUri:string) : any 
    {
        return { 0: {
            
            // label
            __cv_niceLabel: "Artifical Measure",
            "http://www.w3.org/2000/01/rdf-schema#label": "Artifical Measure",
            
            // describe
            __cv_description: "This is an artifical measure created during " +
                              "a data cube merge.",
            
            // uri
            __cv_uri: mergedDataCubeUri + "componentSpecificationMeasure",
            __cv_hashedUri: CryptoJS.MD5(mergedDataCubeUri + "componentSpecificationMeasure") + "",
            
            // relation to measure
            "http://purl.org/linked-data/cube#measure": mergedDataCubeUri + "measure",
            
            // type
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                "http://purl.org/linked-data/cube#ComponentSpecification",
        }};
    }
    
    /**
     *
     */
    public checkAndCreateMergedDataCube() 
    {
        // check if everthing important was loaded
        if (false === this._equalDimensionsFound
            || false === this._measuresReceived
            || false === this._observationsReceived) {
            // ... if not, stop execution of this function now    
            return;
        }
        
        // object representing the data part of configuration
        var mergedDataCube:any = {},
            mergedDataCubeUri:string = "",
            dimensionUri:string = "",
            virtualDimensions:any[] = [];
            
        // TODO check if there is already a merged data cube
        
        // set data cube object
        mergedDataCube = {
            components: {
                attributes: null,
                dimensions: {},
                measures: {}
            },
            dataSets: {},
            dataStructureDefinitions: {},
            numberOfMultipleDimensions: 0,
            numberOfOneElementDimensions: 0,
            selectedComponents: {},
            selectedDS: {},
            selectedDSD: {},
            selectedSlice: {},
            slices: {}
        };
        
        // generate new uri for merged data cube
        mergedDataCubeUri = this.generateMergedDataCubeUri(
            this.app._.backend.url,
            JSON.stringify(this.app._.compareAction)
        );
        
        
        /**
         * set dataset
         */
        mergedDataCube.dataSets = this.buildDataSets(
            mergedDataCubeUri,
            this.app._.compareAction.datasets[1].__cv_niceLabel,
            this.app._.compareAction.datasets[2].__cv_niceLabel,
            this.app._.compareAction.datasets[1].__cv_uri,
            this.app._.compareAction.datasets[2].__cv_uri
        );
        
        mergedDataCube.selectedDS = mergedDataCube.dataSets[0];
        
        
        /**
         * build new virtual component specifications according to equal dimension pairs
         */
        mergedDataCube.components.dimensions = this.buildDimensionsAndTheirCs(
            mergedDataCubeUri,
            this.app._.compareAction.equalDimensions
        );
        
        mergedDataCube.selectedComponents.dimensions = this.getSelectedDimensions(
            $.parseJSON(JSON.stringify(mergedDataCube.components.dimensions))
        );
        
        
        /**
         * set measure
         */
        mergedDataCube.components.measures = this.buildMeasure(
            mergedDataCubeUri
        );
                
        mergedDataCube.selectedComponents.measure = 
            mergedDataCube.components.measures [0];
        
        
        /**
         * set data structure definition
         */
        mergedDataCube.dataStructureDefinitions = this.buildDataStructureDefinitions(
            mergedDataCubeUri,
            mergedDataCube.components.dimensions
        );
        
        mergedDataCube.selectedDSD = mergedDataCube.dataStructureDefinitions[0];
        
        console.log("");
        console.log("mergedDataCube for " + _.size(this.app._.compareAction.equalDimensions) + " equal dimensions:");
        console.log("");
        console.log(mergedDataCube);
        
        
        /**
         * One pair of two equal dimensions
         */
        if (1 == _.size(this.app._.compareAction.equalDimensions)) {
            
            
        }
        
        
        /**
         * two pairs of two equal dimensions
         */
        else if (2 == _.size(this.app._.compareAction.equalDimensions)) {
            
        }
        
        
        /**
         * more than two pairs of two equal dimensions
         */
        else if (2 < _.size(this.app._.compareAction.equalDimensions)) {
            
        }
        
        
        /**
         * no equal dimensions, do nothing
         */
        else { 
            mergedDataCube = null;
        }        
    }
    
    /**
     *
     */
    public destroy () : CubeViz_View_Abstract
    {
        super.destroy();
        return this;
    }
    
    /**
     * @param url string URL the system is running on
     * @param stringifiedObject string Stringified compareAction object
     * @return string New merged data cube uri
     */
    public generateMergedDataCubeUri(url:string, stringifiedObject:string) : string
    {
        return url 
               + "go/mergeddatacube/" 
               + CryptoJS.MD5(stringifiedObject)
               + "#";
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        this.collection.reset("__cv_uri");        
        this.render();
    }
    
    /**
     * @param dimensionElements1 any Object containing a list of dimension elements of dataset1
     * @param dimensionElements2 any Object containing a list of dimension elements of dataset2
     */
    public mergeDimensionElements(dimensionElements1:any, dimensionElements2:any) : any
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
    
    /**
     *
     */
    public onFound_equalDimensions() 
    {
        this._equalDimensionsFound = true;
        
        this.checkAndCreateMergedDataCube();
    }
    
    /**
     *
     */
    public onReceived_measures1AndMeasures2() 
    {
        this._measuresReceived = true;
        
        this.checkAndCreateMergedDataCube();
    }
    
    /**
     *
     */
    public onReceived_observations1AndObservations2() 
    {
        this._observationsReceived = true;
        
        this.checkAndCreateMergedDataCube();
    }

    /**
     *
     */
    public onStart_application() 
    {
        this.initialize();
    }
    
    /**
     * 
     */
    public render() : CubeViz_View_Abstract
    {
        this.bindUserInterfaceEvents({
        });
        
        return this;
    }
    
    /**
     *
     */
    public getSelectedDimensions(dimensions:any) 
    {
        var numberOfDimensionElementsToUse:number = Math.floor((Math.random()*5)+1),
            selectedComponentDimensions:any = {};
        
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
}

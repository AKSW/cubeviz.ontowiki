/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_VisualizationSetup extends CubeViz_View_Abstract 
{        
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
                name:    "onStart_application",
                handler: this.onStart_application
            }
        ]);
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
        });        
        
        // from dataset 2
        _.each (dimensionElements2, function (element){

            // only add element of the other dataset's dimension, if its URI
            // was not used before
            if (-1 == $.inArray (element.__cv_uri, usedElementUris)) {
                
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
        // object representing the data part of configuration
        var data:any = {
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
            },
            dimensionUri:string = "";
        
        // set dataset
        data.dataSets = { 0: {
            __cv_description: "",
            __cv_hashedUri: CryptoJS.MD5("__cv_dummyDataset") + "",
            __cv_niceLabel: "A DataSet",
            __cv_uri: "__cv_dummyDataset",
            __cv_consistsOf: [ // add relation to the two origin datasets
                this.app._.compareAction.datasets[1].__cv_uri,
                this.app._.compareAction.datasets[2].__cv_uri,
            ],
            "http://purl.org/linked-data/cube#structure": "__cv_dummyDataStructureDefinition",
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataSet",
            "http://www.w3.org/2000/01/rdf-schema#label": "A DataSet"
        }};
        
        // set data structure definition
        data.dataStructureDefinitions = { 0: {
            __cv_description: "",
            __cv_hashedUri: CryptoJS.MD5("__cv_dummyDataStructureDefinition") + "",
            __cv_niceLabel: "A DataStructureDefinition",
            __cv_uri: "__cv_dummyDataStructureDefinition",
            "http://purl.org/linked-data/cube#component": {
                0: this.app._.compareAction.equalDimensions[0][0].__cv_uri,
                1: "__cv_dummyMeasureCs"
            },
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#DataStructureDefinition",
            "http://www.w3.org/2000/01/rdf-schema#label": "A DataStructureDefinition"
        } };
        
        // set measure
        data.components.measures = { 0: {
            __cv_description: "",
            __cv_hashedUri: CryptoJS.MD5("__cv_dummyMeasureCs") + "",
            __cv_niceLabel: "Measure",
            __cv_uri: "__cv_dummyMeasureCs",
            "http://purl.org/linked-data/cube#measure": "__cv_dummyMeasure",
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://purl.org/linked-data/cube#ComponentSpecification",
            "http://www.w3.org/2000/01/rdf-schema#label": "Measure"
        } };
        
        
        
        /**
         * One pair of two equal dimensions
         */
        if (1 == _.size(this.app._.compareAction.equalDimensions)) {
            
            dimensionUri = this.app._.compareAction.equalDimensions[0][0].__cv_uri;
            
            // set equal dimension (component specification):
            data.components.dimensions[dimensionUri] = {
                
                // uri
                __cv_uri: dimensionUri,
                __cv_hashedUri: CryptoJS.MD5(dimensionUri) + "",
                
                // labels
                __cv_niceLabel: 
                    this.app._.compareAction.equalDimensions[0][0].__cv_niceLabel,
                __cv_shortLabel: 
                    this.app._.compareAction.equalDimensions[0][0].__cv_niceLabel,
                "http://www.w3.org/2000/01/rdf-schema#label": 
                    this.app._.compareAction.equalDimensions[0][0].__cv_niceLabel,
                
                __cv_description: "",
                __cv_shortDescription: "",
                
                __cv_elementCount: 0,
                __cv_elements: {},
                
                __cv_selectedElementCount: 0,
                
                // dimension property
                "http://purl.org/linked-data/cube#dimension": 
                    this.app._.compareAction.equalDimensions[0][0]["http://purl.org/linked-data/cube#dimension"],
                                            
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": 
                    "http://purl.org/linked-data/cube#ComponentSpecification"
            };
            
            // add elements of both dimension
            data.components.dimensions[dimensionUri].__cv_elements = this.mergeDimensionElements (
                this.app._.compareAction.equalDimensions[0][0].__cv_elements,
                this.app._.compareAction.equalDimensions[0][1].__cv_elements
            );         
            
            data.components.dimensions[dimensionUri].__cv_elementCount = _.size(
                data.components.dimensions[dimensionUri].__cv_elements
            );
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
            data = null;
        }
        
        console.log("");
        console.log(_.size(this.app._.compareAction.equalDimensions) + " equal dimensions:");
        console.log(data);
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
}

/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_GeneralDatasetInformation extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_GeneralDatasetInformation", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onReceived_attributes1AndAttributes2",
                handler: this.onReceived_attributes1AndAttributes2
            },
            {
                name:    "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
            },
            {
                name:    "onReceived_measure1AndMeasure2",
                handler: this.onReceived_measures1AndMeasures2
            },
            {
                name:    "onReceived_numbersOfObservations1AndNumbersOfObservations2",
                handler: this.onReceived_numbersOfObservations1AndNumbersOfObservations2
            },
            {
                name:    "onReceived_slices1AndSlices2",
                handler: this.onReceived_slices1AndSlices2
            },
            {
                name:    "onSelected_dataset1",
                handler: this.onSelected_dataset1
            },
            {
                name:    "onSelected_dataset2",
                handler: this.onSelected_dataset2
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
    public displayAttributesInformation1() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        
        // Dimensions
        $($(informationPieceBoxes.get(2))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.components.attributes [1])
            );
        
        $("#cubeviz-compare-generalDatasetInformation1").show();
    }
    
    /**
     *
     */
    public displayAttributesInformation2() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        
        // Dimensions
        $($(informationPieceBoxes.get(2))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.components.attributes [2])
            );
        
        $("#cubeviz-compare-generalDatasetInformation2").show();
    }
    
    /**
     *
     */
    public displayDimensionsInformation1() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        
        // Dimensions
        $($(informationPieceBoxes.get(0))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.components.dimensions [1])
            );
        
        $("#cubeviz-compare-generalDatasetInformation1").show();
    }
    
    /**
     *
     */
    public displayDimensionsInformation2() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        
        // Dimensions
        $($(informationPieceBoxes.get(0))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.components.dimensions [2])
            );
        
        $("#cubeviz-compare-generalDatasetInformation2").show();
    }
    
    /**
     *
     */
    public displayMeasuresInformation1() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        
        // Measures
        $($(informationPieceBoxes.get(1))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.components.measures [1])
            );
        
        $("#cubeviz-compare-generalDatasetInformation1").show();
    }
    
    /**
     *
     */
    public displayMeasuresInformation2() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        
        // Measures
        $($(informationPieceBoxes.get(1))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.components.measures [2])
            );
        
        $("#cubeviz-compare-generalDatasetInformation2").show();
    }
    
    /**
     *
     */
    public displayNumberOfObservations1() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        
        // Measures
        $($(informationPieceBoxes.get(4))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                this.app._.compareAction.numberOfObservations [1]
            );
        
        $("#cubeviz-compare-generalDatasetInformation1").show();
    }
    
    /**
     *
     */
    public displayNumberOfObservations2() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        
        // Measures
        $($(informationPieceBoxes.get(4))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                this.app._.compareAction.numberOfObservations [2]
            );
        
        $("#cubeviz-compare-generalDatasetInformation2").show();
    }
    
    /**
     *
     */
    public displaySlicesInformation1() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation1").find(".cubeviz-compare-informationPieceBox");
        
        // Measures
        $($(informationPieceBoxes.get(3))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.slices[1])
            );
        
        $("#cubeviz-compare-generalDatasetInformation1").show();
    }
    
    /**
     *
     */
    public displaySlicesInformation2() 
    {
        var informationPieceBoxes = $("#cubeviz-compare-generalDatasetInformation2").find(".cubeviz-compare-informationPieceBox");
        
        // Measures
        $($(informationPieceBoxes.get(3))
            .find(".cubeviz-compare-informationPieceBoxValue").first())
            .html (
                _.size(this.app._.compareAction.slices[2])
            );
        
        $("#cubeviz-compare-generalDatasetInformation2").show();
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
     *
     */
    public handleDatasetSelectorChanges(datasetNr:string) 
    {
        var self = this;
        
        // nullify information, for the case, the following load-functions
        // does not return anything / is not working
        this.app._.compareAction.components.dimensions [datasetNr] = null;
        this.app._.compareAction.components.measures [datasetNr] = null;
        this.app._.compareAction.components.attributes [datasetNr] = null;
        
        /**
         * load according dimensions
         */
        DataCube_Component.loadAllDimensions(
            this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri,
            this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], 
            this.app._.compareAction.datasets[datasetNr].__cv_uri, 
            
            // callback
            function(result){
                
                // set dimension > dataset assignment and data new
                self.app._.compareAction.components.dimensions [datasetNr] = result;
                
                self.triggerGlobalEvent ("onReceived_dimensions" + datasetNr);                
            
                // there are two dimension groups received
                if (false === _.isNull (self.app._.compareAction.components.dimensions[1])
                    && false === _.isNull (self.app._.compareAction.components.dimensions[2])) {
                    
                    self.triggerGlobalEvent ("onReceived_dimensions1AndDimensions2");
                }
            }
        );
        
        /**
         * load according measures
         */
        DataCube_Component.loadAllMeasures(
            this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri,
            this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], 
            this.app._.compareAction.datasets[datasetNr].__cv_uri, 
            
            // callback
            function(result){
                
                // set dimension > dataset assignment and data new
                self.app._.compareAction.components.measures [datasetNr] = result;
                
                self.triggerGlobalEvent ("onReceived_measures" + datasetNr);                
            
                // there are two dimension groups received
                if (false === _.isNull (self.app._.compareAction.components.measures[1])
                    && false === _.isNull (self.app._.compareAction.components.measures[2])) {
                    self.triggerGlobalEvent ("onReceived_measure1AndMeasure2");
                }
            }
        );
        
        /**
         * load according attributes
         */
        DataCube_Component.loadAllAttributes(
            this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri,
            this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], 
            this.app._.compareAction.datasets[datasetNr].__cv_uri, 
            
            // callback
            function(result){
                
                // set dimension > dataset assignment and data new
                self.app._.compareAction.components.attributes [datasetNr] = result;
                
                self.triggerGlobalEvent ("onReceived_attributes" + datasetNr);                
            
                // there are two dimension groups received
                if (false === _.isNull (self.app._.compareAction.components.measures[1])
                    && false === _.isNull (self.app._.compareAction.components.measures[2])) {
                    self.triggerGlobalEvent ("onReceived_attributes1AndAttributes2");
                }
            }
        );
        
        /**
         * load according slices
         */
        DataCube_Slice.loadAll(
            this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri,
            this.app._.compareAction.datasets[datasetNr]["http://purl.org/linked-data/cube#structure"], 
            this.app._.compareAction.datasets[datasetNr].__cv_uri, 
            
            // callback
            function(result){
                
                // set dimension > dataset assignment and data new
                self.app._.compareAction.slices [datasetNr] = result;
                
                self.triggerGlobalEvent ("onReceived_slices" + datasetNr);                
            
                // there are two dimension groups received
                if (false === _.isNull (self.app._.compareAction.slices[1])
                    && false === _.isNull (self.app._.compareAction.slices[2])) {
                    self.triggerGlobalEvent ("onReceived_slices1AndSlices2");
                }
            }
        );
        
        /**
         * load according number of observations
         */
        DataCube_Observation.loadNumberOfObservations(
            this.app._.backend.url, "", this.app._.compareAction.models[datasetNr].__cv_uri,
            this.app._.compareAction.datasets[datasetNr].__cv_uri, 
            
            // callback
            function(result){
                
                // set dimension > dataset assignment and data new
                self.app._.compareAction.numberOfObservations [datasetNr] = result;
                
                self.triggerGlobalEvent ("onReceived_observationNumber" + datasetNr);                
            
                // there are two dimension groups received
                if (-1 < self.app._.compareAction.numberOfObservations[1]
                    && -1 < self.app._.compareAction.numberOfObservations[2]) {
                    self.triggerGlobalEvent ("onReceived_numbersOfObservations1AndNumbersOfObservations2");
                }
            }
        );
    }
    
    /**
     *
     */
    public onSelected_dataset1(event) 
    {
        this.handleDatasetSelectorChanges("1");
    }
    
    /**
     *
     */
    public onSelected_dataset2(event) 
    {
        this.handleDatasetSelectorChanges("2");
    }
    
    /**
     *
     */
    public onReceived_attributes1AndAttributes2() 
    {
        this.displayAttributesInformation1 ();
        this.displayAttributesInformation2 ();
    }
    
    /**
     *
     */
    public onReceived_dimensions1AndDimensions2() 
    {
        this.displayDimensionsInformation1 ();
        this.displayDimensionsInformation2 ();
    }
    
    /**
     *
     */
    public onReceived_measures1AndMeasures2() 
    {
        this.displayMeasuresInformation1 ();
        this.displayMeasuresInformation2 ();
    }
    
    /**
     *
     */
    public onReceived_numbersOfObservations1AndNumbersOfObservations2() 
    {
        this.displayNumberOfObservations1 ();
        this.displayNumberOfObservations2 ();
    }
    
    /**
     *
     */
    public onReceived_slices1AndSlices2() 
    {
        this.displaySlicesInformation1 ();
        this.displaySlicesInformation2 ();
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

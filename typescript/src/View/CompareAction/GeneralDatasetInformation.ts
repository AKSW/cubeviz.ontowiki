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
                name:    "onReceived_dimensions1AndDimensions2",
                handler: this.onReceived_dimensions1AndDimensions2
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
    public displayDimensionInformation1() 
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
    public displayDimensionInformation2() 
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
    public onReceived_dimensions1AndDimensions2() 
    {
        this.displayDimensionInformation1 ();
        this.displayDimensionInformation2 ();
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

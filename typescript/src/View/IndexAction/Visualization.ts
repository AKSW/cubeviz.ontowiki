/// <reference path="..\..\..\declaration\libraries\Highcharts.d.ts" />
/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_IndexAction_Visualization extends CubeViz_View_Abstract 
{
    /**
     * 
     */    
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_IndexAction_Visualization", attachedTo, app);
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    {
        super.destroy();
        
        return this;
    }
    
    /**
     *
     */
    public initialize() 
    {        
        /**
         * Load observations based on pre-configured data structure definition and 
         * data set. Function onComplete_loadObservations will handle incoming data.
         */
        var obs = DataCube_Observation;
        $(obs).on("loadComplete", $.proxy(this.onComplete_loadObservations, this));
        obs.loadAll(this.app._.data.linkCode, this.app._.backend.url);
    }
    
    /**
     *
     */
    public onClick_nothingFoundNotificationLink(event) 
    {
        $("#cubeviz-visualization-nothingFoundFurtherExplanation")
            .slideDown("slow");
    }
     
    /**
     *
     */
    public onComplete_loadObservations(event, retrievedObservations) : void
    {
        // save retrieved observations
        this.app._.data.retrievedObservations = retrievedObservations;
            
        // compute and save number of multiple dimensions
        this.app._.data.numberOfMultipleDimensions = _.size(
            CubeViz_Visualization_Controller.getMultipleDimensions (
                this.app._.data.selectedComponents.dimensions
            )
        );
        
        this.render();
    }

    /**
     *
     */
    public render() 
    {
        // If at least one observation was retrieved
        if ( 1 <= _.size(this.app._.data.retrievedObservations) ) {
                    
            // set default className
            this.app._.ui.visualization.class = this.app._.chartConfig[
                this.app._.data.numberOfMultipleDimensions
            ].charts[0].class;
                            
            /**
             * Render chart with the given data
             */            
            // get chart name
            var charts = this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts,
            
                // get class
                fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                    this.app._.ui.visualization.class, charts
                ),
                  
                type = CubeViz_Visualization_Controller.getVisualizationType(
                    this.app._.ui.visualization.class
                );
            
            switch ( type ) 
            {
                case "CubeViz":
                    
                    console.log("render cubeviz visz");
                    /*
                    var visz = Visualization_CubeViz.load ( className );
                    
                    visz.init (
                        CubeViz_Data ["retrievedObservations"], 
                        CubeViz_Links_Module,
                        fromChartConfig ["defaultConfig"]
                    );
                    
                    visz.render ();*/
                
                    break;
                    
                default: // HighCharts
                    
                    // if chart was created before, first destroy this instance
                    if(false === _.isUndefined(this.app._.generatedVisualization)){
                        this.app._.generatedVisualization.destroy();
                    }
                    
                    var hC = new CubeViz_Visualization_HighCharts();
                    
                    // load specific chart instance
                    var chart = hC.load(this.app._.ui.visualization.class);
                    
                    // init chart instance
                    chart.init(
                        fromChartConfig.defaultConfig,
                        this.app._.data.retrievedObservations,
                        this.app._.data.selectedComponents.dimensions,
                        CubeViz_Visualization_Controller.getOneElementDimensions (
                            this.app._.data.selectedComponents.dimensions
                        ),
                        CubeViz_Visualization_Controller.getMultipleDimensions ( 
                            this.app._.data.selectedComponents.dimensions
                        ),
                        this.app._.data.selectedComponents.measures,
                        CubeViz_Visualization_Controller.getSelectedMeasure(
                            this.app._.data.selectedComponents.measures
                        ).typeUrl,
                        this.app._.data.selectedDSD.label,
                        this.app._.data.selectedDS.label
                    );
                    
                    // show chart
                    this.app._.generatedVisualization = new Highcharts.Chart(
                        chart.getRenderResult()
                    );
                
                    break;
            }
            
            /**
             * Setup click event for chartSelection item's
             *
            ChartSelector.init ( 
                CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"],
                Viz_Event.onClick_ChartSelectionItem
            );*/
        } 
        
        // If nothing was retrieved
        else {
            
            $("#cubeviz-index-visualization")
                .html ("")
                .append (
                    $("#cubeviz-visualization-nothingFoundNotificationContainer").html()
                );
        }
        
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "click #cubeviz-visualization-nothingFoundNotificationLink":
                this.onClick_nothingFoundNotificationLink
        });
        
        this.app.renderView("View_IndexAction_VisualizationSelector");
        
        return this;
    }
}

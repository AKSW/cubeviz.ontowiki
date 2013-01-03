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
    public render() 
    {
        // If at least one observation was retrieved
        if ( 1 <= _.size(this.app._.data.retrievedObservations) ) {
                            
            /**
             * Render chart with the given data
             */            
            // get chart name
            var charts = this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts,
            
                className = this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts[0].class,
            
                // get class
                fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                    className, charts
                ),
                  
                type = CubeViz_Visualization_Controller.getVisualizationType(className);
            
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
                    
                    var chart = CubeViz_Visualization_HighCharts.load(className);
                    
                    // init chart instance
                    chart.init(
                        this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts[0].class,
                        fromChartConfig.defaultConfig,
                        this.app._.data.retrievedObservations,
                        this.app._.data.selectedComponents.dimensions,
                        CubeViz_Visualization_Controller.getOneElementDimensions (
                            this.app._.data.retrievedObservations, 
                            this.app._.data.selectedComponents.dimensions,
                            this.app._.data.selectedComponents.measures
                        ),
                        CubeViz_Visualization_Controller.getMultipleDimensions ( 
                            this.app._.data.selectedComponents.dimensions
                        ),
                        this.app._.data.selectedComponents.measures,
                        CubeViz_Visualization_Controller.getMeasureTypeUrl(
                            this.app._.data
                        ),
                        this.app._.data.selectedDSD.label,
                        this.app._.data.selectedDS.label
                    );
                    
                    // show chart
                    new Highcharts.Chart(chart.getRenderResult());
                
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
            
            /**
            $("#container")
                .html ("")
                .append ($("#cubeviz-Index-NothingFoundNotificationContainer").html());
                
            
            
             * Notification: Empty data retrieved
             *
            $("#cubeviz-Index-NothingFoundNotificationLink").click(Viz_Event.onClick_NothingFoundNotificationLink);
                
            Viz_Main.closeChartSelection();
            Viz_Main.closeChartSelectionMenu();
            Viz_Main.hideMenuDongle();*/
        }
        
        
        /**
         * Delegate events to new items of the template
         */
        // this.delegateEvents({});
        
        return this;
    }
}

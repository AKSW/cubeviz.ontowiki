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
        console.log("constructor");
        console.log(app);
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
    public onComplete_loadObservations(entries) 
    {
        this.app._.data.retrievedObservations = entries;
        
        // get number of multiple dimensions
        this.app._.data.numberOfMultipleDimensions = CubeViz_Visualization_Controller
            .getNumberOfMultipleDimensions (
                entries, 
                this.app._.data.selectedComponents.dimensions,
                this.app._.data.selectedComponents.measures
            ); 
        
        // If at least one observation was received
        if ( 0 < _.size(entries) ) {
              
            /**
             * Render chart with the given data
             */
            this.renderChart ( 
                this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions]
                    .charts[0].class
            );
            
            /**
             * Setup click event for chartSelection item's
             *
            ChartSelector.init ( 
                CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"],
                Viz_Event.onClick_ChartSelectionItem
            );*/
        } 
        
        // If nothing was received
        else {
            
            /**
            $("#container")
                .html ("")
                .append ($("#cubeviz-Index-NothingFoundNotificationContainer").html());
                
            
            
             * Notification: Empty data received
             *
            $("#cubeviz-Index-NothingFoundNotificationLink").click(Viz_Event.onClick_NothingFoundNotificationLink);
                
            Viz_Main.closeChartSelection();
            Viz_Main.closeChartSelectionMenu();
            Viz_Main.hideMenuDongle();*/
        }
    }
    
    /**
     *
     */
    public initialize() 
    {        
        var self = this;
        
        /**
         * Load observations based on pre-configured data structure definition and data set.
         */
        var obs = DataCube_Observation;
        $(obs).on("loadComplete", $.proxy(this.onComplete_loadObservations, this));
        obs.loadAll(this.app._.backend.url, this.app._.data.linkCode);
    }

    /**
     *
     */
    public render() 
    {        
        /**
         * Delegate events to new items of the template
         */
        this.delegateEvents({
        });
        
        return this;
    }
    
    /**
     *
     */
    public renderChart(className) : void
    {
        // get chart name
        var charts = this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts,
        
            // get class
            fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass (
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
                
                console.log("render highcharts chart");
                
                /*
                var chart = Visualization_HighCharts.load ( className );
                    
                // init chart instance
                chart.init ( 
                    CubeViz_Data ["retrievedObservations"], 
                    CubeViz_Links_Module,
                    fromChartConfig ["defaultConfig"]
                );
                        
                // show chart
                new Highcharts.Chart(chart.getRenderResult());*/
            
                break;
        }
    }
}

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
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onChange_visualizationClass",
                handler: this.onChange_visualizationClass
            },
            {
                name:    "onReRender_visualization",
                handler: this.onReRender_visualization
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
        this.render();
    }
    
    /**
     *
     */
    public onChange_visualizationClass() 
    {
        this.renderChart();
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
    public onReRender_visualization() 
    {
        this.render();
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
    public render() 
    {
        // If at least one observation was retrieved
        if ( 1 <= _.size(this.app._.data.retrievedObservations) ) {
            
            this.renderChart();
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
        
        return this;
    }
    
    /**
     *
     */
    public renderChart() : void
    {
        // Dynamiclly set visualization container height
        // get chart config
        var fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.class,
                this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts
            ),                
            type:string = null, 
            visualizationSetting:any = null;            
        
        // set default className
        if(true === _.isUndefined(fromChartConfig)) {
            this.app._.ui.visualization.class = this.app._.backend.chartConfig[
                this.app._.data.numberOfMultipleDimensions
            ].charts[0].class;
            
            fromChartConfig = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.class,
                this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts
            );
        }
        
        // extract visualization settings
        visualizationSetting = CubeViz_Visualization_Controller.updateVisualizationSettings(
            [],
            this.app._.ui.visualizationSettings[this.app._.ui.visualization.class],
            fromChartConfig.defaultConfig
        );
        
        // determine if using HighCharts or CubeViz
        type = CubeViz_Visualization_Controller.getVisualizationType(
            this.app._.ui.visualization.class
        );
        
        var offset:any = $(this.attachedTo).offset();
        $(this.attachedTo).css ( 
            "height", $(window).height() - offset.top - 60
        );  
        
        /**
         * Render chart with the given data
         */
        switch ( type ) 
        {
            case "CubeViz":
                
                console.log("render cubeviz visz");
                
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
                    visualizationSetting,
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
    }
}
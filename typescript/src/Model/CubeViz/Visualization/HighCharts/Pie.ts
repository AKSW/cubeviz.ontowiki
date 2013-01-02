/**
 * Fits if you have exactly 1 multiple dimensions.
 */
class CubeViz_Visualization_HighCharts_Pie extends CubeViz_Visualization_HighCharts_Chart 
{    
    /**
     * 
     */
    public init ( selectedComponentDimensions:any, selectedComponentMeasures:any, 
        retrievedObservations, measureUri, dsdLabel:string, dsLabel:string, 
        chartConfig:any ) : void 
    {
                
        this.series = [{"data":[]}];
                
        // this array MUST contains only ONE entry!
        var // selectedComponentDimensions = data.selectedComponents.dimensions, 
            // measures = data.selectedComponents.measures,
            multipleDimensions:any = CubeViz_Visualization_Controller.getMultipleDimensions ( 
                selectedComponentDimensions
            );
            
        // stop execution, if it contains more than one entry
        if ( 1 < _.size(multipleDimensions) ) {
            throw new Error ( "Pie chart is only suitable for one dimension!" );
            return;
        }
        
        var seriesData = [],
            forXAxis = multipleDimensions[0].elements[0].typeUrl,
            // CubeViz_Visualization_Controller.getMeasureTypeUrl (),
            // measureUri = data.selectedComponents.measures[0].url,
            observation = new DataCube_Observation (); 
        
        // save given chart config
        this.chartConfig = chartConfig;
        
        /**
         * Build chart title
         */
        this.chartConfig.title.text = this.buildChartTitle (
            dsdLabel, dsLabel, selectedComponentDimensions
        ); 
                
        /**
         * Initialize observation
         */
        observation.initialize ( 
            retrievedObservations, 
            selectedComponentDimensions, 
            measureUri 
        );
        
        var xAxisElements = observation
            .sortAxis ( forXAxis, "ascending" )
            .getAxisElements ( forXAxis );
            
        seriesData.push ({ 
            type: "pie", 
            name: this.chartConfig.title.text, 
            data: [] 
        });
        
        this.chartConfig.colors = [];
              
        /**
         * Fill data series
         */
        // for ( var value in xAxisElements ) {
        _.each(xAxisElements, function(xAxisElement, uri){
            // var?
            var floatValue:any = parseFloat(xAxisElement[0][measureUri].value);
            if (true === isNaN(floatValue)) {
                floatValue = null;
            } 
            // var?
            var label:any = CubeViz_Visualization_Controller.getLabelForPropertyUri (
                uri, forXAxis, selectedComponentDimensions
            );
            seriesData[0].data.push([label, floatValue]) ;
            
            // set color based on the URI
            this.chartConfig.colors.push (CubeViz_Visualization_Controller.getColor(uri));
        });
        
        this.series = seriesData;
    }
    
    /**
     * 
     */
    public getRenderResult () : Object 
    {
        this.chartConfig.series = this.series;
        return this.chartConfig;
    }
}

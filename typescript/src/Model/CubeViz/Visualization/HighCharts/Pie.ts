/**
 * Fits if you have exactly 1 multiple dimensions.
 */
class CubeViz_Visualization_HighCharts_Pie extends CubeViz_Visualization_HighCharts_Chart 
{        
    /**
     * Initialize a chart instance.
     * @param chartConfig Related chart configuration
     * @param retrievedObservations Array of retrieved observations 
     * @param selectedComponentDimensions
     * @param oneElementDimensions
     * @param multipleDimensions
     * @param selectedComponentMeasures
     * @param selectedMeasureUri Uri of selected measure
     * @param dsdLabel Label of selected data structure definition
     * @param dsLabel Label of selected data set
     * @return void
     */
    public init (chartConfig:any, retrievedObservations:any[], 
        selectedComponentDimensions:any, oneElementDimensions, multipleDimensions, 
        selectedComponentMeasures:any, selectedMeasureUri:string, dsdLabel:string,
        dsLabel:string ) : void 
    {                
        // stop execution, if it contains more than one entry
        if(1 < _.size(multipleDimensions)){
            throw new Error("Pie chart is only suitable for one dimension!");
            return;
        }
        
        var forXAxis = multipleDimensions[0].typeUrl,
            label = "",
            observation = new DataCube_Observation (),
            self = this;
        
        // save given chart config
        this.chartConfig = chartConfig;
        this.chartConfig.series = [];
        this.chartConfig.colors = [];
        
        /**
         * Build chart title
         */
        this.chartConfig.title.text = this.buildChartTitle (
            dsdLabel, dsLabel, oneElementDimensions
        );    
                
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        observation.initialize ( retrievedObservations, selectedComponentDimensions, selectedMeasureUri );
        var xAxisElements:any = observation
            .sortAxis(forXAxis, "ascending")
            .getAxesElements(forXAxis);
            
        this.chartConfig.series.push ({ 
            type: "pie", 
            name: this.chartConfig.title.text, 
            data: [] 
        });
        
        /**
         * Fill data series
         */
        // for ( var value in xAxisElements ) {
        _.each(xAxisElements, function(xAxisElement, propertyUrl){
            
            var floatValue:any = parseFloat(xAxisElement[0][selectedMeasureUri].value);
            
            if (isNaN(floatValue)) {
                floatValue = null;
            } 
            
            label = CubeViz_Visualization_Controller.getLabelForPropertyUri (
                forXAxis, propertyUrl, selectedComponentDimensions
            );
            self.chartConfig.series[0].data.push([label, floatValue]) ;
            
            // set color based on the URI
            self.chartConfig.colors.push(
                CubeViz_Visualization_Controller.getColor(propertyUrl)
            );
        });
    }
}

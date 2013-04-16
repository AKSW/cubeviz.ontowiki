/**
 * Fits if you have exactly 1 multiple dimensions.
 */
class CubeViz_Visualization_HighCharts_Pie extends CubeViz_Visualization_HighCharts_Chart 
{        
    /**
     * Initialize a chart instance.
     * @param chartConfig Related chart configuration
     * @param retrievedObservations Array of retrieved observations 
     * @param selectedComponentDimensions Array of dimension objects with
     *                                    selected component dimensions.
     * @param oneElementDimensions Array of dimension objects where only one
     *                             dimension element was selected.
     * @param multipleDimensions Array of dimension objects where at least two
     *                           dimension elements were selected.
     * @param selectedMeasureUri Uri of selected measure
     * @return void
     */
    public init (chartConfig:any, retrievedObservations:any[], 
        selectedComponentDimensions:any, multipleDimensions:any[],
        oneElementDimensions:any[], selectedMeasureUri:string) 
        : CubeViz_Visualization_HighCharts_Chart 
    {                
        // stop execution, if it contains more than one entry
        if(1 < _.size(multipleDimensions)){
            throw new Error("Pie chart is only suitable for one dimension!");
            return;
        }
        
        var forXAxis = multipleDimensions[_.keys(multipleDimensions)[0]]
                ["__cv_uri"],
            label:string = "",
            observation = new DataCube_Observation (),
            self = this,
            usedXAxisElements:string[] = [],
            value:number = 0;
        
        // save given (default) chart config
        this.chartConfig = chartConfig;
        this.chartConfig.colors = [];
        this.chartConfig.series = [];
        this.chartConfig.title.text = "";
        
        // x axis: set default, if unset
        if (true === _.isUndefined(this.chartConfig.xAxis)) {
            this.chartConfig.xAxis = {
                title: {
                    text: ""
                }
            };
        }
        
        // y axis: set default, if unset
        if (true === _.isUndefined(this.chartConfig.yAxis)) {
            this.chartConfig.yAxis = {
                title: {
                    text: ""
                }
            };
        }
            
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        observation.initialize ( retrievedObservations, selectedComponentDimensions, selectedMeasureUri );
        var xAxisElements:any = observation
            // .sortAxis(forXAxis, "ascending")
            .getAxesElements(forXAxis);
            
        this.chartConfig.series.push ({ 
            type: "pie", 
            name: this.chartConfig.title.text, 
            data: [] 
        });
        
        /**
         * now we take care about the series
         */
        _.each(xAxisElements, function(xAxisElement){
            
            // go through all observations
            _.each(xAxisElement.observations, function(observation){
            
                try {
                    value = parseFloat(observation[selectedMeasureUri]);
                } catch (ex) {
                    // if it comes at this point, parsing to float was not possible
                    // which means, its not a number and not usable for HighCharts
                    return;
                }
                
                // if x axis element label is not in use yet
                if(-1 == $.inArray(xAxisElement.self.__cv_niceLabel, usedXAxisElements)) {
                    self.chartConfig.series[0].data.push([
                        xAxisElement.self.__cv_niceLabel, value
                    ]);
               
                    // set color based on the URI
                    self.chartConfig.colors.push(
                        CubeViz_Visualization_Controller.getColor(xAxisElement.self.__cv_uri)
                    );
                    
                    // remember used label
                    usedXAxisElements.push(xAxisElement.self.__cv_niceLabel);
                    
                } else {
                    return;
                }
            });
        });
        
        return this;
    }
}

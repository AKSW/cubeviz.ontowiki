/**
 * 
 */
class CubeViz_Visualization_HighCharts_Chart 
{
    public chartConfig:any;
    public xAxis:any;
    
    /**
     * Returns the chart title for the given data.
     * @param dsdLabel Label of the selected data structure definition
     * @param dsLabel Label of the selected data set
     * @param oneElementDimensions List of all one element dimensions
     * @return string Title for the given data
     */
    public buildChartTitle ( dsdLabel:string, dsLabel:string, oneElementDimensions:any[]) : string 
    {        
        var builtTitle = "";
        
        _.each(oneElementDimensions, function(dimension){
            builtTitle += " - " + dimension.elements[0].propertyLabel;
        });
        
        return dsdLabel + " - " + dsLabel + " - " + builtTitle;
    }
    
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
        var forXAxis = null,
            forSeries = null,
            observation = new DataCube_Observation (),
            self = this; 
        
        // save given chart config
        this.chartConfig = chartConfig;
        
        if(true === _.isUndefined(self.chartConfig.xAxis)){
            this.chartConfig.xAxis = {categories: []};
        }
        
        /**
         * Build chart title
         */
        this.chartConfig.title.text = this.buildChartTitle (
            dsdLabel, dsLabel, oneElementDimensions
        );        

        // assign selected dimensions to xAxis and series (yAxis)
        _.each(selectedComponentDimensions, function(selectedDimension){
            if ( null == forXAxis ) {
                forXAxis = selectedDimension.typeUrl;
            } else {
                forSeries = selectedDimension.typeUrl;
            }
        });
        
        // If set, switch axes
        /*if ( true == CubeViz_Data ["_highchart_switchAxes"] ) {
            var tmp = forXAxis;
            forXAxis = forSeries;
            forSeries = tmp;
        }*/
        
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        observation.initialize ( retrievedObservations, selectedComponentDimensions, selectedMeasureUri );
        var xAxisElements:any = observation
            .sortAxis(forXAxis, "ascending")
            .getAxesElements(forXAxis);
            
        // put labels for properties to the axis
        _.each(xAxisElements, function(element, propertyUrl){
            self.chartConfig.xAxis.categories.push(
                CubeViz_Visualization_Controller.getLabelForPropertyUri ( 
                    forXAxis, propertyUrl, selectedComponentDimensions
                )
            );
        });
        
        // now we will care about the series
        var floatValue = 0,
            found:bool = false,
            i:number = 0,
            length:number = _.keys(xAxisElements).length,
            obj:any = {},
            seriesElements:any = observation.getAxesElements(forSeries);
            
        self.chartConfig.series = [];

        _.each(seriesElements, function(seriesElement, seriesKey){
            
            // this represents one item of the series array (of highcharts)
            obj = { 
                color: CubeViz_Visualization_Controller.getColor(seriesKey),
                data: [],
                name: CubeViz_Visualization_Controller.getLabelForPropertyUri ( 
                    forSeries, seriesKey, selectedComponentDimensions
                )
            };
            
            // iterate over all x axis elements
            _.each(xAxisElements, function(xAxisValue, xAxisKey){
                
                found = false;
                
                // check for each entry of the x axis, if one of its entries contains a ref 
                // to the the given seriesEntry
                _.each(xAxisValue, function(value, key){
                    
                    // stop further execution because we found our related value
                    if(true == found){
                        return;
                    }
                    
                    // if one of the xAxis entries fits with given seriesEntry, so push the related value 
                    // into the obj [data] array
                    _.each(value[selectedMeasureUri].ref, function(refValue, refKey){
                        if ( seriesKey == refValue[forSeries].value){
                            floatValue = parseFloat(value[selectedMeasureUri].value);
                            
                            if (isNaN(floatValue)) {
                                floatValue = null;
                            } 
                               
                            obj.data.push ( floatValue );
                            found = true;
                            
                            // .. break this loop ...
                            return;
                        }
                    });
                });
                
                // Push null, if it was not possible to found the related value, to prevent highcharts sort 
                // valid values at the beginning because it violates the order of entries
                if ( false == found ) {
                    obj.data.push ( null );
                }
            });
            
            self.chartConfig.series.push (obj);
        });
    }
    
    /**
     * 
     */
    public getRenderResult () : any 
    {       
        return this.chartConfig;
    }
}

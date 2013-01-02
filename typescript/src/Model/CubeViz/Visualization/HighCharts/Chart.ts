/**
 * Mother class for all HighCharts charts
 */
class CubeViz_Visualization_HighCharts_Chart 
{
    /**
     * 
     */
    public xAxis:any = {"categories": []};
    
    /**
     * formally yAxis
     */
    public series = [];
    
    /**
     * Complete chart configuration for a certain chart
     */
    public chartConfig:any = {};    
    
    /**
     * Returns the chart title for the given data.
     */
    public buildChartTitle(dsdLabel:string, dsLabel:string, selectedComponentDimensions:any) : string 
    {
        var //dsdLabel = data.selectedDSD.label, 
            //dsLabel = data.selectedDS.label,
            
            // extract dimensions which only contain 1 element
            oneElementDimensions = CubeViz_Visualization_Controller.getOneElementDimensions (
                selectedComponentDimensions
            ),
            
            // build first part of chart title
            builtTitle = dsdLabel + " - " + dsLabel;
        
        _.each(oneElementDimensions, function(dimension){
            builtTitle += " - " + _.first(dimension.elements).propertyLabel;
        });
        
        return builtTitle;
    } 
    
    /**
     * 
     */
    public init ( selectedComponentDimensions:any, selectedComponentMeasures:any, 
        retrievedObservations, measureUri, dsdLabel:string, dsLabel:string, 
        classDefaultConfig:any ) : void 
    {
        var forXAxis = null,
            forSeries = null,
            // selectedComponentDimensions = data.selectedComponents.dimensions, 
            // measures = data.selectedComponents.measures, 
            // measureUri = CubeViz_Visualization_Controller.getMeasure(data).uri,
            multipleDimensions = CubeViz_Visualization_Controller.getMultipleDimensions ( 
                selectedComponentDimensions
            ),
            observation = new DataCube_Observation,
            // selectedDimensions = data.selectedComponents.dimensions,
            self = this; 
        
        // save given chart config
        this.chartConfig = classDefaultConfig;
        
        /**
         * Build chart title
         */
        this.chartConfig.title.text = this.buildChartTitle (
            dsdLabel, dsLabel, selectedComponentDimensions
        );        

        // assign selected dimensions to xAxis and series (yAxis)        
        // $(selectedDimensions).each(function(i, dimension){
        _.each(selectedComponentDimensions, function(selectedComponentDimension){
            if ( null == forXAxis ) {
                forXAxis = selectedComponentDimension.typeUrl;
            } else {
                forSeries = selectedComponentDimension.typeUrl;
            }
        });
        
        // If set, switch axes
        // TODO maybe use > ui.viszGeneral.highCharts.switchAxes
        /*if ( true == data["_highchart_switchAxes"] ) {
            var tmp = forXAxis;
            forXAxis = forSeries;
            forSeries = tmp;
        }*/
        
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        observation.initialize ( 
            retrievedObservations, 
            selectedComponentDimensions, 
            measureUri 
        );
        
        var xAxisElements:any = observation.sortAxis ( forXAxis, "ascending" )
                                           .getAxisElements ( forXAxis );
            
        // $(xAxisElements).each(function(value, e){
        _.each(xAxisElements, function(value){
            self.xAxis.categories.push(
                CubeViz_Visualization_Controller.getLabelForPropertyUri ( 
                    value, forXAxis, selectedComponentDimensions 
                )
            );
        });
        
        // now we will care about the series
        var found:bool = false,
            i:number = 0,
            length:number = _.keys(xAxisElements).length,
            obj:any = {},
            seriesElements:Object = observation.getAxisElements ( forSeries );
            
        this.series = [];

        
        // for ( var seriesEntry in seriesElements ) 
        // $(seriesElements).each(function(seriesEntry, element){
        _.each(seriesElements, function(seriesEntry){
            
            // this represents one item of the series array (of highcharts)
            obj = { 
                name: CubeViz_Visualization_Controller.getLabelForPropertyUri ( 
                    seriesEntry, forSeries, selectedComponentDimensions 
                ),
                data: [],
                color: CubeViz_Visualization_Controller.getColor ( seriesEntry )
            };
            
            // iterate over all x axis elements
            // for ( var xAxisEntry in xAxisElements ) {
            // $(xAxisElements).each(function(xAxisEntry, xAxisElement){
            _.each(xAxisElements, function(xAxisElement){
                
                found = false;
                
                // check for each entry of the x axis, if one of its entries contains a ref 
                // to the the given seriesEntry
                // for ( var i in xAxisElements[xAxisEntry] ) {
                // $(xAxisElement).each(function(i, ele){
                _.each(xAxisElement, function(ele){
                    
                    if(true === found) return;
                    
                    // if one of the xAxis entries fits with given seriesEntry, so push the related value 
                    // into the obj [data] array
                    // for ( var j in xAxisElements[xAxisEntry][i][measureUri]["ref"] ) {
                    _.each(ele[measureUri].ref, function(relatedElementValue){
                        
                        if(true === found) return;
                        
                        if (seriesEntry == relatedElementValue[forSeries].value) {
                            // TODO using var necessary?
                            var floatValue = parseFloat(relatedElementValue);
                            
                            obj.data.push(true == _.isNaN(floatValue) ? null : floatValue);
                            found = true;
                        }
                        
                    });
                });
                          
                // Push null, if it was not possible to found the related value, to prevent highcharts sort 
                // valid values at the beginning because it violates the order of entries
                if ( false == found ) {
                    obj.data.push ( null );
                }
            });
            
            this.series.push (obj);
        });
    }
    
    /**
     * 
     */
    public getRenderResult () : Object 
    { 
        this.chartConfig.xAxis  = this.xAxis;
        this.chartConfig.series = this.series;        
        return this.chartConfig;
    }
}

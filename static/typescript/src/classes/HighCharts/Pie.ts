/**
 * Fits if you have exactly 1 multiple dimensions.
 */
class HighCharts_Pie extends HighCharts_Chart {
        
    /**
     * formally yAxis
     */
    private series = [{"data":[]}];
    
    /**
     * Complete chart configuration for a certain chart
     */
    private chartConfig = {};
    
    
    /**
     * 
     */
    public init ( retrievedData:any, selectedComponentDimensions:Object[], measures:Object[], chartConfig:Object ) : void {
        
        // save given chart config
        this.chartConfig = chartConfig;
        
        // this array MUST contains only ONE entry!
        var multipleDimensions = HighCharts_Chart.getMultipleDimensions ( 
            retrievedData, selectedComponentDimensions, measures
        );
            
        // stop execution, if it contains more than one entry
        if ( 1 < multipleDimensions ["length"] ) {
            System.out ( "Pie chart is only suitable for one dimension!" );
            System.out ( multipleDimensions );
            return;
        }
        
        var value:number = 0;
        
        for ( var i in multipleDimensions [0]["elements"] ) {
            
            value = HighCharts_Chart.getValueByDimensionProperties ( 
                retrievedData, 
                [multipleDimensions [0]["elements"][i]], 
                HighCharts_Chart.extractMeasureValue ( measures )
            ); value = undefined !== value ? value : 0;
            
            this ["series"][0]["data"].push ( [ 
                multipleDimensions [0]["elements"][i]["property_label"],
                value
            ] );
        }
    }
    
    /**
     * 
     */
    public getRenderResult () : Object {
        this.chartConfig ["series"] = this ["series"];
        return this.chartConfig;
    }
}

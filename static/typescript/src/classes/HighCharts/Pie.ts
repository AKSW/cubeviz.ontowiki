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
    public init ( entries:any, cubeVizLinksModule:Object, chartConfig:Object ) : void {
                
        // this array MUST contains only ONE entry!
        var selectedComponentDimensions = cubeVizLinksModule ["selectedComponents"]["dimensions"], 
            measures = cubeVizLinksModule ["selectedComponents"]["measures"],
            multipleDimensions = HighCharts_Chart.getMultipleDimensions ( 
                entries, selectedComponentDimensions, measures
            );            
            
        // stop execution, if it contains more than one entry
        if ( 1 < multipleDimensions ["length"] ) {
            System.out ( "Pie chart is only suitable for one dimension!" );
            System.out ( multipleDimensions );
            return;
        }
        
        var data = [],
            forXAxis = multipleDimensions [0]["elements"][0]["dimension_type"],
            measureUri = HighCharts_Chart.extractMeasureValue ( measures ),
            observation = new Observation (); 
        
        // save given chart config
        this ["chartConfig"] = chartConfig;
        
        /**
         * Build chart title
         */
        this ["chartConfig"]["title"]["text"] = this.buildChartTitle (cubeVizLinksModule, entries); 
                
        observation.initialize ( entries, selectedComponentDimensions, measureUri );
        
        var xAxisElements = observation
            .sortAxis ( forXAxis, "ascending" )
            .getAxisElements ( forXAxis );
        
        data.push ({ "type": "pie", name: "TODO", "data": [] });
                    
        for ( var value in xAxisElements ) {
            data[0]["data"].push ([
                value, xAxisElements[value][0][measureUri]["value"]
            ]);
        }
        
        this["series"] = data;
        
        System.out ( "generated series:" );
        System.out ( this["series"] );
    }
    
    /**
     * 
     */
    public getRenderResult () : Object {
        this.chartConfig ["series"] = this ["series"];
        return this.chartConfig;
    }
}

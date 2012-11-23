/**
 * Fits if you have exactly 1 multiple dimensions.
 */
class Visualization_HighCharts_Pie extends Visualization_HighCharts_Chart {
        
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
            multipleDimensions = Visualization_Controller.getMultipleDimensions ( 
                entries, selectedComponentDimensions, measures
            );
            
        // stop execution, if it contains more than one entry
        if ( 1 < multipleDimensions ["length"] ) {
            System.out ( "Pie chart is only suitable for one dimension!" );
            System.out ( multipleDimensions );
            return;
        }
        
        var data = [],
            forXAxis = multipleDimensions [0]["elements"][0]["typeUrl"],
            measureUri = Visualization_Controller.getMeasureTypeUrl (),
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
            
        data.push ({ "type": "pie", name: this ["chartConfig"]["title"]["text"], "data": [] });
        
        this ["chartConfig"]["colors"] = [];
              
        /**
         * Fill data series
         */
        for ( var value in xAxisElements ) {
            var floatValue = parseFloat(xAxisElements[value][0][measureUri]["value"]);
            if (isNaN(floatValue)) {
                floatValue = null;
            } 
            var label = Visualization_Controller.getLabelForPropertyUri (value, forXAxis, selectedComponentDimensions );
            data[0]["data"].push([label, floatValue]) ;
            
            // set color based on the URI
            this ["chartConfig"]["colors"].push (Visualization_Controller.getColor(value));
        }
        
        this["series"] = data;
        
        System.out ( "generated piechart-series:" );
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

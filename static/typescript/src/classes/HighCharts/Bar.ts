/**
 * Fits if you have 1 or 2 multiple dimensions.
 */
class HighCharts_Bar extends HighCharts_Chart {
    
    /**
     * 
     */
    private xAxis = {
        "categories": []
    };
    
    /**
     * formally yAxis
     */
    private series = [];
    
    /**
     * Complete chart configuration for a certain chart
     */
    private chartConfig = {};
    
    
    /**
     * 
     */
    public init ( entries:any, selectedComponentDimensions:Object[], measures:Object[], chartConfig:Object ) : void {
                
        var forXAxis = null,
            forSeries = null,
            measureUri = HighCharts_Chart.extractMeasureValue ( measures ),
            multipleDimensions = HighCharts_Chart.getMultipleDimensions ( 
                entries, selectedComponentDimensions, measures
            ),
            observation = new Observation (); 
        
        // save given chart config
        this ["chartConfig"] = chartConfig;
        

        // assign selected dimensions to xAxis and series (yAxis)
        for ( var dimensionLabel in selectedComponentDimensions ) {
            if ( null == forXAxis ) {
                forXAxis = selectedComponentDimensions[dimensionLabel]["type"];
            } else {
                forSeries = selectedComponentDimensions[dimensionLabel]["type"];
            }
        }
        
        observation.initialize ( entries, selectedComponentDimensions, measureUri );
        var xAxisElements = observation
            .sortAxis ( forXAxis, "ascending" )
            .getAxisElements ( forXAxis );
        
        for ( var value in xAxisElements ) {
            this ["xAxis"]["categories"].push ( value );
        }
        
        var seriesElements = observation.getAxisElements ( forSeries ),
            obj = {};
            
        this["series"] = [];
            
        for ( var value in seriesElements ) {
            obj = {};
            obj ["name"] = value;
            obj ["data"] = [];
            
            for ( var i in xAxisElements ) {
                for ( var j in xAxisElements [i] ) { 
                                              
                    // for 1 dimension
                    if ( 0 == multipleDimensions ["length"] || 1 == multipleDimensions ["length"] ) {
                        obj ["data"].push ( xAxisElements[i][j][measureUri]["value"] );
                    }
                    // for 2 dimensions
                    else if ( "undefined" != System.toType ( xAxisElements[i][j][measureUri]["ref"] ) 
                               && value == xAxisElements[i][j][measureUri]["ref"][0][forSeries]["value"] ) {
                        obj ["data"].push ( xAxisElements[i][j][measureUri]["value"] );
                    } else if ( "undefined" == System.toType ( xAxisElements[i][j][measureUri]["ref"] ) ) {
                        obj ["data"].push ( null );
                    }
                }
            }
            
            this["series"].push (obj);
        }
    }
    
    /**
     * 
     */
    public getRenderResult () : Object {
        this["chartConfig"]["xAxis"] = this ["xAxis"];
        this["chartConfig"]["series"] = this ["series"];        
        return this.chartConfig;
    }
}

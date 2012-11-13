/**
 * Provides functions to decide which visualization to load
 */
class Visualization_Controller {
    
    /**
     * 
     */
    static getFromChartConfigByClass ( className:string, charts:Object[] ) : string {
        for ( var i in charts ) {
            if ( className == charts [i]["class"] ) {
                return charts [i];
            }
        }
    }    
    
    /**
     * @return Object[]
     */
    static getMultipleDimensions ( retrievedData:Object[], selectedDimensions:Object[],
                                    measures:Object[] ) : Object [] {
                                                
        // assign selected dimensions to xAxis and series (yAxis)
        var multipleDimensions:Object[] = [],
            tmp:Object[] = [];
        
        for ( var hashedUrl in selectedDimensions ) {
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 < selectedDimensions [hashedUrl] ["elements"]["length"] ) {
                
                multipleDimensions.push ( {
                    "label" : selectedDimensions [hashedUrl]["label"],
                    "elements" : selectedDimensions [hashedUrl] ["elements"] 
                } ); 
            }
        }
        
        return multipleDimensions;
    }
    
    /**
     * @return integer at least 0
     */
    static getNumberOfMultipleDimensions ( retrievedData:Object[], 
                                            selectedDimensions:Object[],
                                            measures:Object[] ) : number {
                                                
        var dims = Visualization_Controller.getMultipleDimensions (
            retrievedData, selectedDimensions, measures
        );
        
        return dims ["length"];
    }
    
    /**
     * 
     */
    static getVisualizationType (className:string) : string {
        if ( "Table" == className ) {
            return "CubeViz";
        }
        return "HighCharts";
    }
}

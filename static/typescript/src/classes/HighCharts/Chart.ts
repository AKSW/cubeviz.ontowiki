class HighCharts_Chart {
    
    /**
     * Extract the uri of the measure value
     */
    static extractMeasureValue ( measures:Object[] ) : string {
        for ( var label in measures ) { return measures[label]["type"]; }
    }
    
    /**
     * @return integer at least 0
     */
    static getNumberOfMultipleDimensions ( retrievedData:Object[], 
                                            selectedDimensions:Object[],
                                            measures:Object[] ) : number {
                                                
        // assign selected dimensions to xAxis and series (yAxis)
        var multipleDimensions:number[] = [],
            tmp:Object[] = [];
            
        for ( var dimensionLabel in selectedDimensions ) {
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 < selectedDimensions [dimensionLabel] ["elements"]["length"] ) {
                multipleDimensions.push ( 1 ); 
            }
        }
        
        return multipleDimensions ["length"];
    }
    
    /**
     * 
     */
    public init ( entries:any, cubeVizConfig:Object, chartConfig:any ) : void {
    }
    
    /**
     * 
     */
    public getRenderResult () : Object {
        return {};
    }
    
    /**
     * Go through retrieved data and build a certain component dimension element (e.g. Year > 2003)
     * a list of its values.
     */
    static groupElementsByPropertiesUri ( dimensionTypeUri:string, propertiesValueUri:string, 
                                           entries:any ) : Object [] {

        var seriesData = []; // e.g. for http://data.lod2.eu/scoreboard/properties/year
                
        /**
         * Dont forget, you are doing this only for a certain dimension (set by uri)
         */
        for ( var mainIndex in entries ) {
            
            for ( var propertyUri in entries [mainIndex] ) {
                
                // If you are in the dimension for the series, go further ...
                if ( propertyUri == dimensionTypeUri ) {
                    
                    // if seriesData [ certain dimension element uri ] is not set
                    // examples for certain dimension element uri:
                    // - 2010
                    // - http://data.lod2.eu/scoreboard/indicators/FOA_cit_Country_ofpubs
                    if ( undefined === seriesData [entries [mainIndex][propertyUri][0]["value"]] ) {
                        seriesData [entries [mainIndex][propertyUri][0]["value"]] = [];
                    }
                    
                    // push new value
                    seriesData [entries [mainIndex][propertyUri][0]["value"]].push (
                        entries [mainIndex][propertiesValueUri][0]["value"]
                    );
                }
            }
        }
        
        return seriesData;
    }
}

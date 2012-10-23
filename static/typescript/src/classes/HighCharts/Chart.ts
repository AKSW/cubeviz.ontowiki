class HighCharts_Chart {
    
    /**
     * Following functions will be implemented by EACH chart subclass!
     */
    
    /**
     * 
     */
    public init ( entries:any, selectedComponentDimensions:Object[], measures:Object[], chartConfig:any ) : void { }
    
    /**
     * 
     */
    public getRenderResult () : Object { return {}; }
        
    
    /**
     * ---------------------------------------------------------------
     */
    
    /**
     * Extract the uri of the measure value
     */
    static extractMeasureValue ( measures:Object[] ) : string {
        for ( var label in measures ) { return measures[label]["type"]; }
    }
    
    /**
     * @return Object[]
     */
    static getMultipleDimensions ( retrievedData:Object[], selectedDimensions:Object[],
                                    measures:Object[] ) : Object [] {
                                                
        // assign selected dimensions to xAxis and series (yAxis)
        var multipleDimensions:Object[] = [],
            tmp:Object[] = [];
            
        for ( var dimensionLabel in selectedDimensions ) {
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 < selectedDimensions [dimensionLabel] ["elements"]["length"] ) {
                multipleDimensions.push ( {
                    "dimensionLabel" : dimensionLabel,
                    "elements" : selectedDimensions [dimensionLabel] ["elements"] 
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
                                                
        var dims = HighCharts_Chart.getMultipleDimensions (
            retrievedData, selectedDimensions, measures
        );
        
        return dims ["length"];
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
    
    /**
     * 
     */
    static getFromChartConfigByClass ( className:string, charts:Object[] ) {
        for ( var i in charts ) {
            if ( className == charts [i]["class"] ) {
                return charts [i];
            }
        }
    }
    
    /**
     * 
     */
    static getValueByDimensionProperties ( retrievedData:Object[], 
                                            dimensionProperties:Object[],
                                            propertiesValueUri:string ) : number {
        
        /**
         * retrievedData [i] could looks like:
         
                http://data.lod2.eu/scoreboard/properties/indicator: Array[1]
                http://data.lod2.eu/scoreboard/properties/unit: Array[1]
                http://data.lod2.eu/scoreboard/properties/value: Array[1]
                http://data.lod2.eu/scoreboard/properties/year: Array[1]
                http://purl.org/linked-data/cube#dataSet: Array[1]
                http://www.w3.org/1999/02/22-rdf-syntax-ns#type: Array[1]
                http://www.w3.org/2000/01/rdf-schema#label: Array[1] 
            ...
         */
         
        var currentRetrDataValue = null,
            dimProperty = null;            
        
        for ( var i in retrievedData ) {
            for ( var dimensionType in retrievedData [i] ) {
                for ( var iDP in dimensionProperties ) {
                    if ( dimensionProperties [iDP]["dimension_type"] == dimensionType ) {
                        
                        dimProperty = dimensionProperties [iDP]["property"];
                        currentRetrDataValue = retrievedData [i];
                        
                        if ( dimProperty == currentRetrDataValue[ dimensionType ][0]["value"] ) {
                            return currentRetrDataValue[ propertiesValueUri ][0]["value"];
                        }
                    }
                }
            }
        }
    }    
    
    /**
     * Update ChartConfig entry with new value. Required e.g. for chart selection menu.
     */
    static setChartConfigClassEntry ( className:string, charts:Object[], newValue:any ) {
        for ( var i in charts ) {
            if ( className == charts [i]["class"] ) {
                charts [i] = newValue;
            }
        }
    }
}

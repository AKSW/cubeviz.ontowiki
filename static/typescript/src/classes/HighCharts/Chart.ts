class HighCharts_Chart {
    
    /**
     * Returns the chart title for the given data.
     */
    public buildChartTitle ( cubeVizLinksModule:Object, retrievedObservations:Object[] ) : string {
        
        var dsdLabel = cubeVizLinksModule ["selectedDSD"]["label"],
            dsLabel = cubeVizLinksModule ["selectedDS"]["label"],
            
            oneElementDimensions = HighCharts_Chart.getOneElementDimensions (
                retrievedObservations, 
                cubeVizLinksModule ["selectedComponents"]["dimensions"],
                cubeVizLinksModule ["selectedComponents"]["measures"]
            ),
            // build first part of chart title
            builtTitle = dsdLabel + " - " + dsLabel;
        
        for ( var i in oneElementDimensions ) {
            builtTitle += " - " + oneElementDimensions[i]["elements"][0]["property_label"];
        }
        
        return builtTitle;
    }
    
    /**
     * 
     */
    public init ( entries:any, cubeVizLinksModule:Object, chartConfig:any ) : void { 
    
        var forXAxis = null,
            forSeries = null,
            selectedComponentDimensions = cubeVizLinksModule ["selectedComponents"]["dimensions"], 
            measures = cubeVizLinksModule ["selectedComponents"]["measures"], 
            measureUri = HighCharts_Chart.extractMeasureValue ( measures ),
            multipleDimensions = HighCharts_Chart.getMultipleDimensions ( 
                entries, selectedComponentDimensions, measures
            ),
            observation = new Observation (); 
        
        // save given chart config
        this ["chartConfig"] = chartConfig;
        
        /**
         * Build chart title
         */
        this ["chartConfig"]["title"]["text"] = this.buildChartTitle (cubeVizLinksModule, entries);        

        // assign selected dimensions to xAxis and series (yAxis)
        for ( var dimensionLabel in selectedComponentDimensions ) {
            if ( null == forXAxis ) {
                forXAxis = selectedComponentDimensions[dimensionLabel]["type"];
            } else {
                forSeries = selectedComponentDimensions[dimensionLabel]["type"];
            }
        }
        
        // initializing observation handling instance with given elements
        // after init, sorting the x axis elements ascending
        observation.initialize ( entries, selectedComponentDimensions, measureUri );
        var xAxisElements:Object = observation
            .sortAxis ( forXAxis, "ascending" )
            .getAxisElements ( forXAxis );
            
        for ( var value in xAxisElements ) {
            this ["xAxis"]["categories"].push (
                this.getLabelForPropertyUri ( value, forXAxis, selectedComponentDimensions )
            );
        }
        
        // now we will care about the series
        var alreadyNullAdded:bool = false,
            found:bool = false,
            i:number = 0,
            length:number = System.countProperties (xAxisElements),
            obj:Object = {},
            seriesElements:Object = observation.getAxisElements ( forSeries );
            
        this["series"] = [];

        for ( var seriesEntry in seriesElements ) {
            
            obj = { 
                "name": this.getLabelForPropertyUri ( seriesEntry, forSeries, selectedComponentDimensions ),
                "data": []
            };
            
            for ( var xAxisEntry in xAxisElements ) {
                
                found = false, alreadyNullAdded = false;
                
                for ( var i in xAxisElements[xAxisEntry] ) {
                    
                    for ( var j in xAxisElements[xAxisEntry][i][measureUri]["ref"] ) {                                                
                        if ( seriesEntry == xAxisElements[xAxisEntry][i][measureUri]["ref"][j][forSeries]["value"] ) {
                            obj ["data"].push ( xAxisElements[xAxisEntry][i][measureUri]["value"] );
                            found = true;
                            break;
                        }
                    }
                    if ( true == found ) {
                        break;
                    }                     
                }                
                if ( false == found ) {
                    obj ["data"].push ( null );
                }
            }
            
            this["series"].push (obj);
        }
        
        System.out ( "" );
        System.out ( "generated series:" );
        System.out ( this["series"] );
    }
    
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
    static getOneElementDimensions ( retrievedData:Object[], selectedDimensions:Object[],
                                      measures:Object[] ) : Object [] {
                                                
        // assign selected dimensions to xAxis and series (yAxis)
        var oneElementDimensions:Object[] = [],
            tmp:Object[] = [];
            
        for ( var dimensionLabel in selectedDimensions ) {
                        
            // Only put entry to multipleDimensions if it have at least 2 elements
            if ( 1 == selectedDimensions [dimensionLabel] ["elements"]["length"] ) {
                oneElementDimensions.push ( {
                    "dimensionLabel" : dimensionLabel,
                    "elements" : selectedDimensions [dimensionLabel] ["elements"] 
                } ); 
            }
        }
        
        return oneElementDimensions;
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
     * Returns the label of the given property uri.
     */
    public getLabelForPropertyUri ( propertyUri:string, dimensionType:string, selectedDimensions:Object[] ) : string {
        var dim:Object = {};
                
        for ( var dimensionLabel in selectedDimensions ) {
            
            dim = selectedDimensions[dimensionLabel];
            
            // Stop if the given dimension was found (by type)
            if ( dim["type"] == dimensionType ) {
                
                for ( var i in dim["elements"] ) {
                    if ( dim["elements"][i]["property"] == propertyUri ) {
                        return dim["elements"][i]["property_label"];
                    }
                }
            }
        }
        
        // if nothing was found, simply return the given propertyUri
        return propertyUri;
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

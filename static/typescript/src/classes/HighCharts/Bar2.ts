class HighCharts_Bar2 extends HighCharts_Chart {
    
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
    public init ( entries:any, cubeVizConfig:Object, chartConfig:any ) : void {
        
        console.log ("");
        console.log ("entries");
        console.log (entries);
        
        console.log ("");
        console.log ("cubeVizConfig");
        console.log (cubeVizConfig);
        
        console.log ("");
        console.log ("chartConfig");
        console.log (chartConfig);
        
        var dimensionLabels:string[] = [""];
        var forXAxis = null;
        var forSeries = null;
        
        this.chartConfig = chartConfig;
        
        for ( var dimensionLabel in cubeVizConfig ["selectedComponents"]["dimensions"] ) {
            if ( null == forXAxis ) {
                forXAxis = cubeVizConfig ["selectedComponents"]["dimensions"][dimensionLabel];
            } else {
                forSeries = cubeVizConfig ["selectedComponents"]["dimensions"][dimensionLabel];
            }
        }
        
        
        /**
         * Fill x axis
         */
        this.xAxis.categories = [];
        for ( var i in forXAxis ["elements"] ) {
            this.xAxis.categories.push (forXAxis ["elements"][i]["property_label"]);
        }
    
        // sort objects by label, ascending
        this.xAxis.categories.sort(function(a, b) {
           return a.toString().toUpperCase().localeCompare(b.toString().toUpperCase());
        });
        
        
        /**
         * Fill series (y axis)
         */
        this.series = [];
        
        // structure retrieved elements
        var seriesData = this.structureEntries ( forSeries, this.extractMeasureValue (cubeVizConfig), entries );
        
        for ( var i in forSeries ["elements"] ) {
            this.series.push ({ 
                "name": forSeries ["elements"][i]["property_label"],
                "data": seriesData [ forSeries ["elements"][i]["property"] ]
            });
        }
        
        console.log ( "this.series" );
        console.log ( this.series );
    }
    
    /**
     * 
     */
    public getRenderResult () : Object {
        this.chartConfig ["xAxis"] = this.xAxis;
        this.chartConfig ["series"] = this.series;
        return this.chartConfig;
    }
    
    /**
     * 
     */
    public extractMeasureValue ( cubeVizConfig ) {
        for ( var label in cubeVizConfig.selectedComponents.measures ) {
            return cubeVizConfig["selectedComponents"]["measures"][label]["type"];
        }
    }
    
    /**
     * 
     */
    public structureEntries ( forSeries, propertiesValueUri:string, entries:any ) {
        
        var seriesData = {};
        var dimensionType = forSeries.type; // e.g. http://data.lod2.eu/scoreboard/properties/year
        
        console.log ( "entries" );
        console.log ( entries );
        console.log ( "" );
        console.log ( "" );
        
        for ( var mainIndex in entries ) {
            for ( var propertyUri in entries [mainIndex] ) {
                if ( propertyUri == dimensionType ) {
                    if ( "undefined" == typeof seriesData [entries [mainIndex][propertyUri][0]["value"]] ) {
                        seriesData [entries [mainIndex][propertyUri][0]["value"]] = [];
                    }
                    seriesData [entries [mainIndex][propertyUri][0]["value"]].push (
                        entries [mainIndex][propertiesValueUri][0]["value"]
                    );
                }
            }
        }
        return seriesData;
    }
}

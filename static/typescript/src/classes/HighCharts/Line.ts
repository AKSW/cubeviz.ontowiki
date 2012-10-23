/**
 * Fits if you have 1 or 2 multiple dimensions.
 */
class HighCharts_Line extends HighCharts_Chart {
    
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
        
        var dimensionLabels:string[] = [""],
            forXAxis = null,
            forSeries = null;
        
        // save given chart config
        this.chartConfig = chartConfig;
        
        // assign selected dimensions to xAxis and series (yAxis)
        for ( var dimensionLabel in selectedComponentDimensions ) {
            if ( null == forXAxis ) {
                forXAxis = selectedComponentDimensions[dimensionLabel];
            } else {
                forSeries = selectedComponentDimensions[dimensionLabel];
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
        var seriesData = HighCharts_Chart.groupElementsByPropertiesUri ( 
            forSeries ["type"], 
            HighCharts_Chart.extractMeasureValue ( measures ), 
            entries 
        );
        
        // Use only these value from series data, which belong to the selected
        // dimension elements
        for ( var i in forSeries ["elements"] ) {
            this.series.push ({ 
                "name": forSeries ["elements"][i]["property_label"],
                "data": seriesData [ forSeries ["elements"][i]["property"] ]
            });
        }
    }
    
    /**
     * 
     */
    public getRenderResult () : Object {
        this.chartConfig ["xAxis"] = this ["xAxis"];
        this.chartConfig ["series"] = this ["series"];
        return this.chartConfig;
    }
}

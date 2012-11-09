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
    public getRenderResult () : Object {
        this.chartConfig ["xAxis"] = this ["xAxis"];
        this.chartConfig ["series"] = this ["series"];
        return this.chartConfig;
    }
}

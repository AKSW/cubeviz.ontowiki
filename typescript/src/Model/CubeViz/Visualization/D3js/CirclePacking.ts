/**
 * 
 */
class CubeViz_Visualization_D3js_CirclePacking
{
    public chartConfig:any;
    
    /**
     * Initialize a chart instance.
     * @param chartConfig Related chart configuration
     * @param retrievedObservations Array of retrieved observations 
     * @param selectedComponentDimensions Array of dimension objects with
     *                                    selected component dimensions.
     * @param multipleDimensions Array of dimension objects where at least two
     *                           dimension elements were selected.
     * @param oneElementDimensions Array of dimension objects where only one
     *                             dimension element was selected.
     * @param selectedMeasureUri Uri of selected measure
     * @param selectedAttributeUri Uri of selected attribute
     * @return CubeViz_Visualization_D3js_CirclePacking
     */
    public init (chartConfig:any, retrievedObservations:any[], 
        selectedComponentDimensions:any, multipleDimensions:any[],
        oneElementDimensions:any[], selectedMeasure:any,
        selectedAttributeUri:string) 
        : CubeViz_Visualization_D3js_CirclePacking 
    {
        return this;
    }
    
    /**
     * Simply returns the adapted chartConfig.
     * @return any Object to configure HighCharts instance.
     */
    public getRenderResult () : any 
    {       
        return this.chartConfig;
    }
}

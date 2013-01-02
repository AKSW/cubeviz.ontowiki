class CubeViz_Visualization_CubeViz_Visualization 
{    
    public retrievedObservations:any;
    public data:any;
    public chartConfig:any;
    
    /**
     * 
     */
    public init (data:any, chartConfig:any ) : void 
    {
        this.chartConfig = chartConfig;
        this.data = data;
        this.retrievedObservations = data.retrievedObservations;
    }
    
    /**
     * 
     */
    public render () : void
    {        
    }
}

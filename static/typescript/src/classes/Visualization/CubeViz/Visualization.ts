class Visualization_CubeViz_Visualization {
    
    public _entries:Object[] = null;
    public _cubeVizLinksModule:Object[] = null;
    public _chartConfig:Object[] = null;
    
    /**
     * 
     */
    public init (entries:Object[], cubeVizLinksModule:Object[], chartConfig:Object[] ) : void {
        this._chartConfig = chartConfig;
        this._cubeVizLinksModule = cubeVizLinksModule;
        this._entries = entries;
    }
    
    /**
     * 
     */
    public render () : void {
        
    }
}

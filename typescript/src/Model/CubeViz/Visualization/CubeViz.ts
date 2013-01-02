class CubeViz_Visualization_CubeViz {
    
    /**
     * 
     */
    static load (chartName:string) : CubeViz_Visualization_CubeViz_Visualization 
    {
        switch ( chartName ) {
            
            case "CubeViz_Visualization_CubeViz_Table":
                return new CubeViz_Visualization_CubeViz_Table ();
            
            default: 
                throw new Error("Invalid chartName ("+ chartName +") given!");
                return;
        }
    }    
}

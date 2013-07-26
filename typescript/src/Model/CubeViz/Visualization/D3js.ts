/**
 * Head of a collection of classes which wrapps function of D3js library.
 */
class CubeViz_Visualization_D3js extends CubeViz_Visualization
{   
    /**
     * 
     */
    constructor()
    {
        super();
        
        this.name = "D3js";
        
        this.supportedClassNames = [
            "CubeViz_Visualization_D3js_CirclePacking",
            "CubeViz_Visualization_D3js_CirclePackingForClusters"
        ];
    }

    /**
     * Renders a chart.
     * @param chart any Instance of a library chart
     * @return any Initialized chart
     */
    public render(chart:any) : any 
    {
        chart.getRenderResult();
    }
}

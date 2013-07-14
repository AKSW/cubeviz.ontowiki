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
            "CubeViz_Visualization_D3js_CirclePacking"
        ];
    }
}

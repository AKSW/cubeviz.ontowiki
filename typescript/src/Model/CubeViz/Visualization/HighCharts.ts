/**
 * Head of a collection of classes which wrapps function of HighCharts library.
 */
class CubeViz_Visualization_HighCharts 
{    
    /**
     * Get list of supported class names.
     * @return string[] List of supported class names
     */
    static getSupportedClassNames() : string[]
    {
        return [
            "CubeViz_Visualization_HighCharts_Area",
            "CubeViz_Visualization_HighCharts_AreaSpline",
            "CubeViz_Visualization_HighCharts_Bar",
            "CubeViz_Visualization_HighCharts_Column",
            "CubeViz_Visualization_HighCharts_Line",
            "CubeViz_Visualization_HighCharts_Pie",
            "CubeViz_Visualization_HighCharts_Polar",
            "CubeViz_Visualization_HighCharts_Spline"
        ];
    }
    
    /**
     * Loads an instance of a particular class, if this wrapper is responseable 
     * for it.
     * @param c Full name of the class to load
     * @return CubeViz_Visualization_HighCharts_Chart
     * @throws Error If this wrapper is not responseable for given c
     */
    static load (c:string) : CubeViz_Visualization_HighCharts_Chart 
    {
        if(true === CubeViz_Visualization_HighCharts.isResponsibleFor(c)) {
            var chartInstance:CubeViz_Visualization_HighCharts_Chart;
            eval ("chartInstance = new " + c +"();");
            return chartInstance;
        }
        throw new Error ( "Invalid c (" + c + ") given!" );
    }
    
    /**
     * Checks if a given class name is managed by this visualization library wrapper.
     * @param className Name of the class to check
     * @return bool True if this wrapper is responseable for it, false otherwise.
     */
    static isResponsibleFor(className:string) : bool
    {
        return _.contains(
            CubeViz_Visualization_HighCharts.getSupportedClassNames(),
            className
        );
    }
}

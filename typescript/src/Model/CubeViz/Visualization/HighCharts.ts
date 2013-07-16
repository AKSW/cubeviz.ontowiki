/// <reference path="..\..\..\..\declaration\libraries\Highcharts.d.ts" />

/**
 * Head of a collection of classes which wrapps function of HighCharts library.
 */
class CubeViz_Visualization_HighCharts extends CubeViz_Visualization
{   
    /**
     * 
     */
    constructor()
    {
        super();
        
        this.name = "HighCharts";
        
        this.supportedClassNames = [
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
     * Renders a chart.
     * @param chart any Instance of a library chart
     * @return any Initialized chart
     */
    public render(chart:any) : any 
    {
        return new Highcharts.Chart (chart.getRenderResult());
    }
}

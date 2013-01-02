class CubeViz_Visualization_HighCharts {
    
    /**
     * 
     */
    static load (chartName:string) : CubeViz_Visualization_HighCharts_Chart {
        switch ( chartName ) {
            
            case "CubeViz_Visualization_HighCharts_Area":
                return new CubeViz_Visualization_HighCharts_Area ();
            
            case "CubeViz_Visualization_HighCharts_AreaSpline":
                return new CubeViz_Visualization_HighCharts_AreaSpline ();
            
            case "CubeViz_Visualization_HighCharts_Bar":
                return new CubeViz_Visualization_HighCharts_Bar ();
            
            case "CubeViz_Visualization_HighCharts_Column":
                return new CubeViz_Visualization_HighCharts_Column ();
            
            case "CubeViz_Visualization_HighCharts_Line":
                return new CubeViz_Visualization_HighCharts_Line ();
            
            case "CubeViz_Visualization_HighCharts_Pie":
                return new CubeViz_Visualization_HighCharts_Pie ();
            
            case "CubeViz_Visualization_HighCharts_Polar":
                return new CubeViz_Visualization_HighCharts_Polar ();
            
            case "CubeViz_Visualization_HighCharts_Spline":
                return new CubeViz_Visualization_HighCharts_Spline ();
            
            default: 
                throw new Error("Unknown chart name (" + chartName + ")!");
                return;
        }
    }
}

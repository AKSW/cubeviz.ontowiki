class Visualization_HighCharts {
    
    /**
     * 
     */
    static load (chartName:string) : Visualization_HighCharts_Chart {
        switch ( chartName ) {
            
            case 'Visualization_HighCharts_Area':
                return new Visualization_HighCharts_Area ();
            
            case 'Visualization_HighCharts_AreaSpline':
                return new Visualization_HighCharts_AreaSpline ();
            
            case 'Visualization_HighCharts_Bar':
                return new Visualization_HighCharts_Bar ();
            
            case 'Visualization_HighCharts_Column':
                return new Visualization_HighCharts_Column ();
            
            case 'Visualization_HighCharts_Line':
                return new Visualization_HighCharts_Line ();
            
            case 'Visualization_HighCharts_Pie':
                return new Visualization_HighCharts_Pie ();
            
            case 'Visualization_HighCharts_Polar':
                return new Visualization_HighCharts_Polar ();
            
            case 'Visualization_HighCharts_Spline':
                return new Visualization_HighCharts_Spline ();
            
            default: 
                System.out ( "HighCharts - load" );
                System.out ( "Invalid chartName (" + chartName + ") given!" );
                return;
        }
    }
}

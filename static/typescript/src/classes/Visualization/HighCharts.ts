class Visualization_HighCharts {
    
    /**
     * 
     */
    static load (chartName:string) : Visualization_HighCharts_Chart {
        switch ( chartName ) {
            
            case 'Visualization_HighCharts_Bar':
                return new Visualization_HighCharts_Bar ();
            
            case 'Visualization_HighCharts_Line':
                return new Visualization_HighCharts_Line ();
            
            case 'Visualization_HighCharts_Pie':
                return new Visualization_HighCharts_Pie ();
            
            case 'Visualization_HighCharts_Polar':
                return new Visualization_HighCharts_Polar ();
            
            default: 
                System.out ( "HighCharts - load" );
                System.out ( "Invalid chartName (" + chartName + ") given!" );
                return;
        }
    }
}

class Visualization_HighCharts {
    
    /**
     * 
     */
    static loadChart (chartName:string) : Visualization_HighCharts_Chart {
        switch ( chartName ) {
            
            case 'Bar':
                return new Visualization_HighCharts_Bar ();
            
            case 'Line':
                return new Visualization_HighCharts_Line ();
            
            case 'Pie':
                return new Visualization_HighCharts_Pie ();
            
            case 'Polar':
                return new Visualization_HighCharts_Polar ();
            
            default: 
                System.out ( "HighCharts - loadChart" );
                System.out ( "Invalid chartName (" + chartName + ") given!" );
                return;
        }
    }
}

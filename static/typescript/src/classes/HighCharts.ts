class HighCharts {
    
    /**
     * 
     */
    static loadChart (chartName:string) : HighCharts_Chart {
        switch ( chartName ) {
            
            case 'Bar':
                return new HighCharts_Bar ();
            
            case 'Line':
                return new HighCharts_Line ();
            
            case 'Pie':
                return new HighCharts_Pie ();
            
            default: 
                System.out ( "HighCharts - loadChart" );
                System.out ( "Invalid chartName (" + chartName + ") given!" );
                return;
        }
    }
}

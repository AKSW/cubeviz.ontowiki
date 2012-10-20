class HighCharts {
    
    /**
     * 
     */
    static loadChart (chartName:string) : HighCharts_Chart {
        switch ( chartName ) {
            
            /**
             * Two dimensions
             */
            case 'Bar':
                return new HighCharts_Bar ();
            
            default: 
                System.out ( "HighCharts - loadChart" );
                System.out ( "Invalid chartName (" + chartName + ") given!" );
                return;
        }
    }
}

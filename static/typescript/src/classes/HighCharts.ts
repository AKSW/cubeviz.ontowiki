class HighCharts {
    
    /**
     * 
     */
    static loadChart (chartName:string) : HighCharts_Chart {
        switch ( chartName ) {
            
            /**
             * ONE dimension
             */
            case 'Pie':
                return new HighCharts_Pie ();
            
            /**
             * TWO dimensions
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

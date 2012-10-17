class HighCharts {
    
    /**
     * 
     */
    static loadChart (chartName:string) : HighCharts_Chart {
        switch ( chartName ) {
            
            /**
             * Two dimensions
             */
            case 'Bar2':
                return new HighCharts_Bar2 ();
            
            default: 
                System.out ( "HighCharts - loadChart" );
                System.out ( "Invalid chartName given!" );
                return;
        }
    }
}

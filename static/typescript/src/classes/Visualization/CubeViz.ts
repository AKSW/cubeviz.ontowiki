class Visualization_CubeViz {
    
    /**
     * 
     */
    static load (chartName:string) : Visualization_CubeViz_Visualization {
        switch ( chartName ) {
            
            case 'Visualization_CubeViz_Table':
                return new Visualization_CubeViz_Table ();
            
            default: 
                System.out ( "CubeViz - load" );
                System.out ( "Invalid chartName (" + chartName + ") given!" );
                return;
        }
    }    
}

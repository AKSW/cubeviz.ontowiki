/**
 * Handles axises and give you access to functions for sorting etc. pp.
 */
class AxisDominator {
    
    /**
     * 
     */
    private _axes:Object = {};
    
    /**
     * 
     */
    private _selectedDimensionUris:string[] = [];
        
    /**
     * @param entries Array of objects which are pulled observations.
     */
    public initialize ( selectedComponentDimensions:Object[], 
                         entries:Object[] ) : AxisDominator {
        
        if ( "array" != System.toType ( entries ) || 0 == entries ["length"] ) {
            System.out ("");
            System.out ("Entries is empty or not an array!");
            return;
        }
        
        console.log ( "entries" );
        console.log ( entries );
        
        // save uri's of selected component dimensions
        this["_selectedDimensionUris"] = this.extractSelectedDimensionUris ( selectedComponentDimensions );
        
        console.log ( this["_selectedDimensionUris"] );
        
        // create an array for each selected dimension uri and save given values
        for ( var mainIndex in entries ) {            
            for ( var propertyUri in entries [mainIndex] ) {
                
                if ( 0 <= $.inArray ( propertyUri, this["_selectedDimensionUris"] ) ) {
                    
                    if ( "undefined" == System.toType ( this["_axes"][propertyUri] ) ) {
                        this["_axes"][propertyUri] = [];
                    }
                    
                    if ( -1 == $.inArray ( entries [mainIndex] [propertyUri][0]["value"], 
                                            this["_axes"][propertyUri] ) ) {
                        this["_axes"][propertyUri].push ( entries [mainIndex] [propertyUri][0]["value"] );
                    }
                }
            }
        }
        
        console.log ( "_axes" );
        console.log ( this["_axes"] );
        
        return this;
    }
    
    /**
     * 
     */
    public extractSelectedDimensionUris ( elements:Object[] ) : string[] {
        var resultList:string[] = [];        
        for ( var i in elements ) {
            resultList.push ( elements [i]["type"] );
        }
        return resultList;
    }
}

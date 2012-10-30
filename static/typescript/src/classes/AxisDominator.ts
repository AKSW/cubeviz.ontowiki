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
     * 
     */
    private extractSelectedDimensionUris ( elements:Object[] ) : string[] {
        var resultList:string[] = [];        
        for ( var i in elements ) {
            resultList.push ( elements [i]["type"] );
        }
        return resultList;
    }
    
    /**
     * @param entries Array of objects which are pulled observations.
     */
    public initialize ( selectedComponentDimensions:Object[], 
                         entries:Object[],
                         measureUri:string ) : AxisDominator {
        
        if ( "array" != System.toType ( entries ) || 0 == entries ["length"] ) {
            System.out ("\nEntries is empty or not an array!");
            return;
        }
        
        // save uri's of selected component dimensions
        this["_selectedDimensionUris"] = this.extractSelectedDimensionUris ( selectedComponentDimensions );
                
        var dimensionValues = {}, measureObj = {}, selecDimUri = "", selecDimVal = "";
        
        // create an array for each selected dimension uri and save given values
        for ( var mainIndex in entries ) {        
            
            /**
             * e.g. 
             *  [ "http:// ... /country" ] = "Germany"
             *  [ "http:// ... /country" ] = "England"
             *  ...
             */
            dimensionValues = {}, measureObj = {};  
            
            // save measure value (by measureUri)
            if ( "undefined" == System.toType ( this ["_axes"] [measureUri] ) ) {
                this ["_axes"] [measureUri] = {};
            }
            
            this ["_axes"] [measureUri] [entries[mainIndex][measureUri][0]["value"]] = [];
            
              
            // generate temporary list of selected dimension values in the current entry
            for ( var i in this["_selectedDimensionUris"] ) {
                
                // save current selected dimension, to save space
                selecDimUri = this["_selectedDimensionUris"][i];
                selecDimVal = entries[mainIndex][selecDimUri][0]["value"];
                
                dimensionValues [ selecDimUri ] = selecDimVal;
                    
                if ( "undefined" == System.toType ( this ["_axes"] [selecDimUri] ) ) {
                    this ["_axes"] [selecDimUri] = {};
                }
                    
                // e.g. ["_axes"]["http:// ... /country"]["Germany"] = [];
                //                uri                     value
                if ( "undefined" == System.toType ( this ["_axes"][selecDimUri][selecDimVal]) ) {
                    this["_axes"][selecDimUri][selecDimVal] = [];
                }
                
                measureObj [measureUri] = entries[mainIndex][measureUri][0]["value"];
                
                // set references for current dimension                
                this.addAxisEntryPointsTo (
                    this["_selectedDimensionUris"] [i], selecDimVal, measureObj
                );
            }
            
            // fill pointsTo array for measure value
            this.addAxisEntryPointsTo ( 
                measureUri, entries[mainIndex][measureUri][0]["value"], dimensionValues
            );            
        }
        
        console.log ( this ["_axes"]);
        
        return this;
    }
    
    /**
     * 
     */
    private addAxisEntryPointsTo ( uri:string, value:any, dimensionValues:Object ) : void {
        
        if ( false == this.existsPointsToEntry ( uri, value, dimensionValues ) ) {
                        
            for ( var dimensionUri in dimensionValues ) {
                
                // Set current value and reference to axes dimension element
                dimensionValues [dimensionUri] = { 
                    // e.g. value: "Germany"
                    "value" : dimensionValues [dimensionUri],
                    
                    // e.g. ref: this ["_axes"] ["http://.../country"] ["Germany"]
                    "ref" : this ["_axes"][dimensionUri][dimensionValues [dimensionUri]]
                };
            }
            
            this ["_axes"][uri][value].push ( dimensionValues );
        }
    }
    
    /**
     * 
     */
    private existsPointsToEntry ( uri:string, value:any, dimensionValues:Object ) : bool {
        
        var pointsTo = null, allTheSame = false;
        
        if ( 1 > this ["_axes"][uri][value]["length"] ) {
            return false;
        }
        
        for ( var pointsToIndex in this["_axes"][uri][value] ) {
            
            pointsTo = this ["_axes"][uri][value][pointsToIndex];
            
            // go through all pointsTo entries and check if given constalation exists
            for ( var i in pointsTo ) {
                
                allTheSame = false;
                
                for ( var dimensionUri in dimensionValues ) {
                    if ( pointsTo[i]["value"] == dimensionValues [dimensionUri] ) {
                        allTheSame = true;
                    } else {
                        allTheSame = false;
                        break;
                    }
                }
                
                if ( true == allTheSame ) {
                    return true;
                }
            }
        }
        return false;
    }
}

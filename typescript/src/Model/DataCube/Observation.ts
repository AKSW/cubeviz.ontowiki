/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataCube_Observation {
        
    /**
     * 
     */
    public _axes:any = {};
    
    /**
     * 
     */
    private _selectedDimensionUris:string[] = [];
        
    /**
     * 
     */
    private addAxisEntryPointsTo ( uri:string, value:any, dimensionValues:Object ) : void 
    {

        for ( var dimensionUri in dimensionValues ) {
            
            // Set current value and reference to axes dimension element
            dimensionValues [dimensionUri] = { 
                // e.g. value: "Germany"
                "value" : dimensionValues [dimensionUri],
                
                // e.g. ref: this ["_axes"] ["http://.../country"] ["Germany"]
                "ref" : this._axes[dimensionUri][dimensionValues [dimensionUri]]
            };
        }
        
        this._axes[uri][value].push ( dimensionValues );
    } 
        
    /**
     * 
     */
    private extractSelectedDimensionUris ( elements:any[] ) : string[] 
    {
        var resultList:string[] = [];    
          
        _.each(elements, function(element){
            resultList.push ( element.typeUrl );
        });
        
        return resultList;
    }

    /**
     * 
     */
    public getAxisElements ( axisUri:string ) : Object {
        if(undefined === this["axes"][axisUri]) {
            return this ["axes"][axisUri];
        } else {
            console.log ("\nNo elements found given axisUri: " + axisUri);
            return {};
        }
    }

    /**
     * @param entries Array of objects which are pulled observations.
     */
    public initialize ( retrievedObservations:any[], selectedComponentDimensions:any[],
        measureUri:string ) : DataCube_Observation 
    {        
        if ( true !== _.isArray ( retrievedObservations ) || 0 == _.size(retrievedObservations) ) {
            console.log("\nEntries is empty or not an array!");
            return;
        }
        
        // save uri's of selected component dimensions
        this["_selectedDimensionUris"] = this.extractSelectedDimensionUris ( selectedComponentDimensions );
        
        var dimensionValues = {}, measureObj = {}, selecDimUri = "", selecDimVal = "";
        
        // if the measureUri element or sub one is not set, set default values
        this["_axes"][measureUri] = this["_axes"][measureUri] || {};
        
        // create an array for each selected dimension uri and save given values
        for ( var mainIndex in retrievedObservations ) {        
            
            /**
             * Example:
             * { 
             * 
             *      http://data.lod2.eu/scoreboard/properties/indicator: Object
             *          http://data.lod2.eu/scoreboard/indicators/FOA_cit_Country_ofpubs: Array[1]
             *              0: Object
             *                  http://data.lod2.eu/scoreboard/properties/value: Object
             *                      ref: Array[1]
             *                          0: Object
             *                              http://data.lod2.eu/scoreboard/properties/indicator: Object
             *                                  ...
             *                              http://data.lod2.eu/scoreboard/properties/year: Object
             *                                  ...
             *                      value: 0.083333298563957
             * 
             *      http://data.lod2.eu/scoreboard/properties/value: Object
             *          0.083333298563957: Array[1]
             *              0: Object
             *                  http://data.lod2.eu/scoreboard/properties/indicator: Object
             *                      ref: Array[1]
             *                      value: "http://data.lod2.eu/scoreboard/indicators/FOA_cit_Country_ofpubs"
             *                  http://data.lod2.eu/scoreboard/properties/year: Object
             *                      ref: Array[1]
             *                      value: "2001"
             * ...
             * }
             */
            dimensionValues = {};
            
            // e.g. ["http:// ... /value"] = "0.9";
            measureObj = {};  
            
            this["_axes"][measureUri][ retrievedObservations[mainIndex][measureUri][0]["value"] ] = 
                this["_axes"][measureUri][ retrievedObservations[mainIndex][measureUri][0]["value"] ] || [];
              
            // generate temporary list of selected dimension values in the current entry
            for ( var i in this["_selectedDimensionUris"] ) {
                                
                // save current selected dimension, to save space
                selecDimUri = this["_selectedDimensionUris"][i];
                
                if (undefined == retrievedObservations[mainIndex][selecDimUri]) {
                    console.log ( "Nothing found for mainIndex=" + mainIndex + " and selecDimUri=" + selecDimUri );
                    continue;
                }
                
                selecDimVal = retrievedObservations[mainIndex][selecDimUri][0]["value"];
                
                dimensionValues [ selecDimUri ] = selecDimVal;
                    
                // e.g. ["_axes"]["http:// ... /country"] = {};
                if ( undefined == this ["_axes"] [selecDimUri] ) {
                    this ["_axes"][selecDimUri] = {};
                }
                    
                // e.g. ["_axes"]["http:// ... /country"]["Germany"] = [];
                if ( undefined == this ["_axes"] [selecDimUri][selecDimVal] ) {
                    this ["_axes"][selecDimUri][selecDimVal] = [];
                }
                
                measureObj [measureUri] = retrievedObservations[mainIndex][measureUri][0]["value"];
                                
                // set references for current dimension                
                this.addAxisEntryPointsTo (
                    this["_selectedDimensionUris"][i], selecDimVal, measureObj
                );
            }
            
            // fill pointsTo array for measure value
            this.addAxisEntryPointsTo ( 
                measureUri, retrievedObservations[mainIndex][measureUri][0]["value"], dimensionValues
            );            
        }
        
        return this;
    }
    
    /**
     * 
     */
    static loadAll (url:string, linkCode:string) 
    {
        var self = this;
        
        $.ajax({
            url: url + "getobservations/",
            data: { lC: linkCode }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "loadAll error: " + xhr ["responseText"] );
        })
        .done( function (entries) {
            $(self).trigger("loadComplete", [$.parseJSON (entries)]);
        });
    }

    /**
     * @param mode Possible values: ascending (default), descending
     */
    public sortAxis ( axisUri:string, mode?:string ) : DataCube_Observation 
    {
        var mode = undefined == mode ? "ascending" : mode,
            sortedKeys = [], sortedObj = {};

        // Separate keys and sort them
        // TODO port to $().each
        for (var i in this["axes"][axisUri]){        
            sortedKeys.push(i);
        }
        
        switch ( mode ) {
            case "descending": 
                sortedKeys.sort(function(a,b) {
                    a = a.toString().toLowerCase();
                    b = b.toString().toLowerCase(); 
                    return ((a > b) ? -1 : ((a < b) ? 1 : 0));
                });
                break;
            default: // = ascending
                sortedKeys.sort(function(a,b) {
                    a = a.toString().toLowerCase();
                    b = b.toString().toLowerCase(); 
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                });
                break;
        }

        // Reconstruct sorted obj based on keys
        // TODO port to $().each
        for (var i in sortedKeys){
            sortedObj[sortedKeys[i]] = this._axes[axisUri][sortedKeys[i]];
        }
        
        this._axes[axisUri] = sortedObj;
        
        return this;
    }
}

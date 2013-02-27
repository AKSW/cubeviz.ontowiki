/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataCube_Observation {
        
    /**
     * 
     */
    private _axes:Object = {};
    
    /**
     * 
     */
    private _selectedDimensionUris:string[] = [];
        
    /**
     * Add new entry point to axes object
     * @param uri Uri of component dimension
     * @param value Value of component dimension
     * @param dimensionValues Object to add
     * @return void
     */
    private addAxisEntryPointsTo ( uri:string, value:any, dimensionValues:Object ) : void 
    {
        var self = this;
        
        _.each(dimensionValues, function(dimensionValue, dimensionUri){

            // Set current value and reference to axes dimension element
            dimensionValues [dimensionUri] = { 
                // e.g. value: "Germany"
                "value" : dimensionValue,
                
                // e.g. ref: this ["_axes"] ["http://.../country"] ["Germany"]
                "ref" : self._axes[dimensionUri][dimensionValue]
            };
        });
        
        this._axes[uri][value].push ( dimensionValues );
    }    
        
    /**
     * 
     */
    private extractSelectedDimensionUris ( elements:Object[] ) : string[] 
    {
        var resultList:string[] = [];        
        
        _.each(elements, function(element){
            resultList.push(element.typeUrl);
        });
        
        return resultList;
    }

    /**
     * Get axes elements by uri
     * @param uri Uri to identify axes element
     * @return any Values of axes element
     */
    public getAxesElements ( uri:string ) : any 
    {
        if(false === _.isUndefined(this._axes[uri])) {
            return this._axes[uri];
        } else {
            return {};
        }
    }

    /**
     * Initializing with given observations, selected component dimensions and
     * the measure uri.
     * @param retrievedObservations Object containing objects (numberic index)
     *                              which are the retrieved observations
     * @param selectedComponentDimensions Object containing dimensions; key is 
     *                                    hashed dimension type url
     * @param measureUri Uri of the selected measure
     * @return DataCube_Observation Itself
     */
    public initialize ( retrievedObservations:any, selectedComponentDimensions:any,
        measureUri:string ) : DataCube_Observation 
    {
        // no observations retrieved
        if(0 == _.size(retrievedObservations)) {
            return this;
        }
        
        // save uri's of selected component dimensions
        this._selectedDimensionUris = this.extractSelectedDimensionUris(
            selectedComponentDimensions
        );
        
        var dimensionValues = {}, 
            measureObj = {}, 
            selecDimUri = "", 
            selecDimVal = "",
            self = this;
        
        // if the measureUri element or sub one is not set, set default values
        this._axes[measureUri] = this._axes[measureUri] || {};
        
        // create an array for each selected dimension uri and save given values
        _.each(retrievedObservations, function(observation){
        
            // if no value was set for the current observation stop execution
            // and go to the next one
            if(true === _.isUndefined(observation[measureUri])) {
                return;
            }
            
            /**
             * e.g. 
             *  {
             *      "http:// ... /country": "Germany",
             *      "http:// ... /country": "England",
             *      ...
             *  }
             */
            dimensionValues = {};
            
            // e.g. ["http:// ... /value"] = "0.9";
            measureObj = {};
            
            // set measure value of current observation
            self._axes[measureUri][ observation[measureUri][0].value ] = 
                self._axes[measureUri][ observation[measureUri][0].value ] || [];
              
            // generate temporary list of selected dimension values in the current entry
            _.each(self._selectedDimensionUris, function(selecDimUri){
                                                
                if (true === _.isUndefined(observation[selecDimUri])) {
                    return;
                }
                
                selecDimVal = observation[selecDimUri][0].value;
                
                dimensionValues [ selecDimUri ] = selecDimVal;
                    
                // e.g. ["_axes"]["http:// ... /country"] = {};
                if (true === _.isUndefined(self._axes[selecDimUri])) {
                    self._axes[selecDimUri] = {};
                }
                    
                // e.g. ["_axes"]["http:// ... /country"]["Germany"] = [];
                if (true === _.isUndefined(self._axes[selecDimUri][selecDimVal])) {
                    self._axes[selecDimUri][selecDimVal] = [];
                }
                
                measureObj [measureUri] = observation[measureUri][0].value;
                                
                // set references for current dimension                
                self.addAxisEntryPointsTo (selecDimUri, selecDimVal, measureObj);
            });
            
            // fill pointsTo array for measure value
            self.addAxisEntryPointsTo ( 
                measureUri, observation[measureUri][0].value, dimensionValues
            );            
        });
        
        return this;
    }
    
    /**
     * 
     */
    static loadAll (dataHash:string, url:string, callback) 
    {        
        $.ajax({
            url: url + "getobservations/",
            data: {cv_dataHash: dataHash}
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("Observation loadAll error: " + xhr.responseText);
        })
        .done( function (entries) { 
            DataCube_Observation.prepareLoadedResultObservations(entries, callback);
        });
    }
    
    /**
     * 
     */
    static prepareLoadedResultObservations (entries, callback)
    {
        // TODO: fix it, because sometimes you got JSON from server, 
        // sometimes not, than you have to parse it
        var parse = $.parseJSON ( entries );
        if ( null == parse ) {
            callback ( entries );
        } else {
            callback ( parse );
        }
    }

    /**
     * @param mode Possible values: ascending (default), descending
     */
    public sortAxis ( axisUri:string, mode?:string ) : DataCube_Observation 
    {
        var axesEntries = this._axes[axisUri],
            mode = true === _.isUndefined(mode) ? "ascending" : mode,
            sortedKeys = [], 
            sortedObj = {},
            self = this;

        // Separate keys and sort them
        _.each(axesEntries, function(e, key){
            sortedKeys.push(key);
        });
        
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

        // Reconstructing previously sorted obj based on keys
        _.each(sortedKeys, function(key){
            sortedObj[key] = self._axes[axisUri][key];
        });
        
        this._axes[axisUri] = sortedObj;
        
        return this;
    }
}

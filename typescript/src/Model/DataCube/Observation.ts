/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataCube_Observation {
        
    /**
     * 
     */
    private _axes:Object = {};
        
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
     * @param retrievedObservations Object containing retrieved observations
     * @param selectedComponentDimensions Select component dimension objects
     * @param measureUri Uri of the selected measure
     * @return DataCube_Observation Itself
     */
    public initialize ( retrievedObservations:any, selectedComponentDimensions:any,
        measureUri:string ) : DataCube_Observation 
    {
        var dimensionElementInfoObject:any = {},
            dimensionPropertyUri:string = "",
            observationDimensionProperty:any = {},
            self = this,
            value = 0;
        
        this._axes = {};
        
        _.each(retrievedObservations, function(observation){
            
            // Parse observation value, if it is not a number, ignore it.
            try {
                value = parseFloat(observation[measureUri]);
                
                // If value contains whitespaces and it was able to parse
                // it was float, remove whitespaces and parse it again
                if(true === _.str.include(observation[measureUri], " ")) {
                    value = parseFloat(
                        observation[measureUri].replace(/ /gi, "")
                    );
                }
                
                if (true === _.isNaN(value)) {
                    return;
                }
                
                observation[measureUri] = value;
                
            // its not a number, ignore it!
            } catch (ex) { return; }
            
            _.each(selectedComponentDimensions, function(dimension){
                
                // e.g. http://data.lod2.eu/scoreboard/properties/indicator
                dimensionPropertyUri = dimension["http://purl.org/linked-data/cube#dimension"];
                
                // e.g. http://lod2.eu/score/ind/bb_dsl_TOTAL_FBB__lines
                observationDimensionProperty = observation[dimensionPropertyUri];
                
                // set still undefined areas
                if(true === _.isUndefined(self._axes[dimensionPropertyUri])) {
                    self._axes[dimensionPropertyUri] = {};
                } 
                if(true === _.isUndefined(self._axes[dimensionPropertyUri]
                                                    [observationDimensionProperty])) {
                    // get information-object for particular dimension element
                    dimensionElementInfoObject = {};
                    _.each(dimension.__cv_elements, function(dimensionElement){
                        // check if URI's are equal
                        if(dimensionElement.__cv_uri == observationDimensionProperty) {
                            dimensionElementInfoObject = dimensionElement;
                        }
                    });
                                                        
                    self._axes[dimensionPropertyUri][observationDimensionProperty] = {
                        observations: {},
                        self: dimensionElementInfoObject
                    };
                } 
                
                // set axis entry
                self._axes     
                    
                    // key: particular dimension
                    // e.g. http://data.lod2.eu/scoreboard/properties/year        
                    [dimensionPropertyUri]
                
                    // key: particular dimension element
                    // e.g. http://data.lod2.eu/scoreboard/year/2006
                    [observationDimensionProperty]
                    
                    .observations
                    
                    // key: observation uri 
                    // e.g. http://data.lod2.eu/scoreboard/items/bb_fcov/TOTAL_POP/_pop/Austria/2006/country
                    [observation.__cv_uri] = observation;
            });
        });
        
        return this;
    }
    
    /**
     * 
     */
    static loadAll (modelIri:string, dataHash:string, url:string, callback) 
    {        
        $.ajax({
            url: url + "getobservations/",
            data: {
                cv_dataHash: dataHash,
                modelIri: modelIri
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("Observation loadAll error: " + xhr.responseText);
        })
        .done( function (entries) {
            callback(entries.content);
        });
    }

    /**
     * Sort axis elements
     * @param axisUri Key string of the axis to sort
     * @param mode Possible values: ascending (default), descending
     */
    public sortAxis ( axisUri:string, mode?:string ) : DataCube_Observation 
    {
        /*var axesEntries = this._axes[axisUri],
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
                    a = a.self.__cv_niceLabel.toString().toLowerCase();
                    b = b.self.__cv_niceLabel.toString().toLowerCase(); 
                    return ((a > b) ? -1 : ((a < b) ? 1 : 0));
                });
                break;
            default: // = ascending
                sortedKeys.sort(function(a,b) {
                    a = a.self.__cv_niceLabel.toString().toLowerCase();
                    b = b.self.__cv_niceLabel.toString().toLowerCase(); 
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                });
                break;
        }

        // Reconstructing previously sorted obj based on keys
        _.each(sortedKeys, function(key){
            sortedObj[key] = self._axes[axisUri][key];
        });
        
        this._axes[axisUri] = sortedObj;
        */
        return this;
    }
}

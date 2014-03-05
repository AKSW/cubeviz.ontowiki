/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class DataCube_Observation 
{        
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
    public getAxesElements (uri:string) : any 
    {
        if(false === _.isUndefined(this._axes[uri])) {
            return this._axes[uri];
        } else {
            return {};
        }
    }
    
    /**
     *
     */
    static getNumberOfActiveObservations(observations:any) : number 
    {
        var activeOnes:number = 0;
        
        _.each(observations, function(observation){
            if (true === DataCube_Observation.isActive(observation)){
                ++activeOnes;
            }
        });
        
        return activeOnes;
    }
    
    /**
     * @param observations any
     * @param dimensionUri string
     * @return string[] List of used dimension element uris
     */
    static getUsedDimensionElementUris(observations:any, dimensionUri:string) : string[] 
    {
        var usedDimensionElementUris:string[] = [];
        
        _.each(observations, function(observation){
            if (-1 === $.inArray(observation[dimensionUri], usedDimensionElementUris)){
                usedDimensionElementUris.push(observation[dimensionUri]);
            }
        });
        
        return usedDimensionElementUris;
    }
    
    /**
     * Returns a list containing values of the given observations
     * @param observations any
     * @param measureUri string
     * @param areActive bool optional
     * @return any[] 2-element array: first element are the values, 
     *               second if invalid numbers were found 
     */
    static getValues(observations:any, measureUri:string, areActive:bool = false) : any[] 
    {
        var foundInvalidNumber:bool = false,
            value:any = null,
            values:any[] = [];
        
        _.each(observations, function(observation){
            
            if (true === areActive 
                && false === DataCube_Observation.isActive(observation)) {
                return;
            }
            
            value = DataCube_Observation.parseValue(
                observation, measureUri
            );
            
            // something was wrong with the given observation value
            if (true === _.isNull(value)) {
                foundInvalidNumber = true;
                return;
            
            // everything is fine, use this value!
            } else {
                values.push(value);
            }
        });
        
        return [values, foundInvalidNumber];
    }

    /**
     * Initializing with given observations, selected component dimensions and
     * the measure uri.
     * @param retrievedObservations Object containing retrieved observations
     * @param selectedComponentDimensions Select component dimension objects
     * @param measureUri Uri of the selected measure
     * @return DataCube_Observation Itself
     */
    public initialize (retrievedObservations:any, selectedComponentDimensions:any,
        measureUri:string) : DataCube_Observation 
    {
        var dimensionElementInfoObject:any = {},
            dimensionPropertyUri:string = "",
            foundIt:any = null,
            observationDimensionProperty:any = {},
            self = this,
            value:any = 0;
        
        this._axes = {};
        
        _.each(retrievedObservations, function(observation){
            
            if (false === DataCube_Observation.isActive(observation)) {
                return;
            }
            
            value = DataCube_Observation.parseValue(
                observation, measureUri
            );
            
            if (true === _.isNull(value)) {
                return;
            }
            
            _.each(selectedComponentDimensions, function(dimension){
                
                // e.g. http://data.lod2.eu/scoreboard/properties/indicator
                dimensionPropertyUri = dimension["http://purl.org/linked-data/cube#dimension"];
                
                // e.g. http://lod2.eu/score/ind/bb_dsl_TOTAL_FBB__lines
                observationDimensionProperty = observation[dimensionPropertyUri];
                
                // check, if observationDimensionProperty is related to a selected
                // dimension element; in case its not, stop this stage and go further
                foundIt = DataCube_Component.findDimensionElement(
                    dimension.__cv_elements,
                    observationDimensionProperty
                );
                
                if (true === _.isNull(foundIt)) {
                    return;
                }
                
                // set still undefined areas
                if(true === _.isUndefined(self._axes[dimensionPropertyUri])) {
                    self._axes[dimensionPropertyUri] = {};
                } 
                if(true === _.isUndefined(self._axes[dimensionPropertyUri]
                                                    [observationDimensionProperty])) {
                    // get information-object for particular dimension element
                    dimensionElementInfoObject = {
                        __cv_uri: observationDimensionProperty,
                        __cv_niceLabel: observationDimensionProperty
                    };

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
     * @param observation any
     */
    static isActive(observation:any) : bool
    {
        if (false === _.isUndefined (observation.__cv_active) 
            && false === observation.__cv_active) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Loads observation based on datahash or dataset uri.
     * @return void
     */
    static loadAll (url:string, serviceUrl:string, modelIri:string, dataHash:string, 
        datasetUri:string, callback) : void
    {        
        $.ajax({
            url: url + "getobservations/",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                cv_dataHash: dataHash,
                datasetUri: datasetUri
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
     * 
     */
    static loadNumberOfObservations (url:string, serviceUrl:string, modelIri:string, dsUri:string, callback) 
    {        
        $.ajax({
            url: url + "getnumberofobservations/",
            data: {
                serviceUrl: serviceUrl,
                modelIri: modelIri,
                dsUri: dsUri
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error ("Observation loadNumberOfObservations error: " + xhr.responseText);
        })
        .done( function (entries) {
            callback(entries.content);
        });
    }
    
    /**
     * @param observations any 
     * @param selectedDimensions any
     * @param selectedMeasure any
     * @param selectedAttribute any
     * @return any Adapted observations container
     */
    static markActiveObservations(observations:any, selectedDimensions:any,
        selectedMeasure:any, selectedAttribute:any) : any
    {
        // real clone of given observations list
        observations = $.parseJSON(JSON.stringify(observations));
        
        // reset all observations
        _.each(observations, function(observation, key){
            observation.__cv_active = false;            
            observations[key] = observation;
        });
        
        // based on (probably) new set selected dimensions, deactive all observations
        // whose DE's does not fit with selected ones
        var dimensionUri:string = null;
        
        _.each(observations, function(observation, key){
            
            // go through all dimensions
            _.each(selectedDimensions, function(dimension){
                
                dimensionUri = dimension["http://purl.org/linked-data/cube#dimension"];
                
                // if observations related dimension element was found
                if (false === _.isNull (DataCube_Component.findDimensionElement(
                    dimension.__cv_elements, observation [dimensionUri]
                    ))) {
                    observation.__cv_active = true;
                }
            });
        });
        
        return observations;
    }
    
    /**
     * Parse the value of a given observation.
     * @param observation any The observation to parse
     * @param measureUri string Uri of selected measure
     * @param ignoreTemporaryValue bool Force function to ignore temporary value 
     * @return float|null Null if value is not a float, otherwise returns the parsed value
     */
    static parseValue(observation:any, measureUri:string, ignoreTemporaryValue:bool = false) : any 
    {
        var parsedValue:number = null,
            value:string = null;
        
        // set observation value, distinguish between original and user-set
        // one: prefer the user-set one over the original
        if (false === ignoreTemporaryValue
            && false === _.isUndefined(observation.__cv_temporaryNewValue)) {
            value = observation.__cv_temporaryNewValue;
        } else {
            value = observation[measureUri];
        }
        
        // Parse observation value, if it is not a number, return null
        try {
            // If value contains whitespaces, remove whitespaces and parse it
            if(true === _.str.include(value, " ")) {
                parsedValue = parseFloat(value.replace(/ /gi, ""));
            } else {
                parsedValue = parseFloat(value);
            }
            
            // check if its a valid number
            if (false === _.isNaN(parsedValue) && _.isFinite(parsedValue)
                && (0 < parsedValue || 0 > parsedValue || 0 === parsedValue)) {
                return parsedValue;
            }
            
        // its not a number
        } catch (ex) {}
        
        return null;
    }
    
    /**
     * @param observation any The observation to parse
     * @param measureUri string 
     */
    static setOriginalValue(observation:any, measureUri:string, newValue:string) : void 
    {
        if (false === _.isUndefined(observation.__cv_temporaryNewValue)) {
            observation.__cv_temporaryNewValue = null;
            delete observation.__cv_temporaryNewValue;
        } 
        
        observation [measureUri] = newValue;
    }

    /**
     * Sort axis elements
     * @param axisUri Key string of the axis to sort
     * @param mode Possible values: ascending (default), descending
     * @return DataCube_Observation
     */
    public sortAxis(axisUri:string, mode?:string) : DataCube_Observation 
    {
        var axesEntries = this._axes[axisUri],
            mode = true === _.isUndefined(mode) ? "ascending" : mode,
            stuffToSort = [], 
            sortedObj = {},
            self = this;

        // Separate keys and entry labels
        _.each(axesEntries, function(entry, key){
            stuffToSort.push({
                key: key,
                label: entry.self.__cv_niceLabel
            });
        });
        
        // decide wheter to do ascending or descending
        switch (mode) {
            case "descending": 
                stuffToSort.sort(function(a,b) {
                    a = String(a.label).toLowerCase();
                    b = String(b.label).toLowerCase(); 
                    return ((a > b) ? -1 : ((a < b) ? 1 : 0));
                });
                break;
            default: // = ascending
                stuffToSort.sort(function(a,b) {
                    a = String(a.label).toLowerCase();
                    b = String(b.label).toLowerCase();  
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                });
                break;
        }

        // Reconstructing previously sorted obj based on keys
        _.each(stuffToSort, function(entry){
            sortedObj[entry.key] = self._axes[axisUri][entry.key];
        });
        
        this._axes[axisUri] = sortedObj;

        return this;
    }
}

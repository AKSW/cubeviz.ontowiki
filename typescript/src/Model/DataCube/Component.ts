/// <reference path="..\..\..\declaration\jquery.d.ts" />

/**
 * Represents a component which can be a dimension or a measure.
 */
class DataCube_Component {
    
    /**
     * Loads all component dimensions, specified by model uri, data structure 
     * definition, dataset and component type.
     */
    static loadAllDimensions (url, modelUrl, dsdUrl, dsUrl, callback) : void
    {
        $.ajax({
            url: url + "getcomponents/",
            data: { m: modelUrl, dsdUrl: dsdUrl, dsUrl: dsUrl, cT: "dimension" }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "loadAllDimensions error: " + xhr ["responseText"] );
        })
        .done( function (entries) { 
            DataCube_Component.prepareLoadedAllDimensions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllDimensions (entries, callback) : void
    {
        entries = JSON.parse(entries);
                                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        // 
        for ( var i in entries ) {            
            // establish a new structure where the key is the label of the dimension
            tmpEntries[entries[i].hashedUrl] = entries[i];
        }
        
        // call callback function with prepared entries
        callback(tmpEntries);
    }
    
    /**
     * Loads all component measures, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllMeasures (url, modelUrl, dsdUrl, dsUrl, callback) : void
    {
        $.ajax({
            url: url + "getcomponents/",
            data: { m: modelUrl, dsdUrl: dsdUrl, dsUrl: dsUrl, cT: "measure" }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "loadAllMeasures error: " + xhr ["responseText"] );
        })
        .done(function(entries){ 
            DataCube_Component.prepareLoadedAllMeasures (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllMeasures (entries:any, callback) : void 
    {
        entries = JSON.parse (entries);        
                                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        // 
        for ( var i in entries ) {            
            // establish a new structure where the key is the label of the dimension
            tmpEntries[entries[i].hashedUrl] = entries[i];
        }
        
        // call callback function with prepared entries
        callback(tmpEntries);
    }
    
    /**
     * 
     */
    static getDefaultSelectedDimensions ( componentDimensions ) : Object 
    {
        componentDimensions = $.parseJSON(JSON.stringify(componentDimensions));
        
        var result:Object = {};
    
        // TODO use underscore or jQuerys each!
        for ( var dimensionHashedUrl in componentDimensions ) {
            
            result [dimensionHashedUrl] = componentDimensions [dimensionHashedUrl];
            
            result [dimensionHashedUrl]["elements"] = [ result [dimensionHashedUrl].elements [0] ];
        }
        
        return result;
    }
}

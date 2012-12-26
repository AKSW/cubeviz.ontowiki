/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

declare var CubeViz_Links_Module: any;

/**
 * Represents a component which can be a dimension or a measure.
 */
class DataCube_Component {
    
    /**
     * Loads all component dimensions, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllDimensions (dsdUrl:string, dsUrl:string, callback) 
    {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension" // possible: dimension, measure
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            console.log ( "Component > loadAll > error" );
            console.log ( "response text: " + xhr.responseText );
            console.log ( "error: " + thrownError );
        })
        .done( function (entries) { 
            DataCube_Component.prepareLoadedAllDimensions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllDimensions (entries:any, callback) 
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
        callback ( tmpEntries );
    }
    
    /**
     * Loads all component measures, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllMeasures (dsdUrl:string, dsUrl:string, callback) 
    {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "measure" // possible: dimension, measure
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            console.log ( "Component > loadAll > error" );
            console.log ( "response text: " + xhr.responseText );
            console.log ( "error: " + thrownError );
        })
        .done( function (entries) { 
            DataCube_Component.prepareLoadedAllMeasures (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllMeasures (entries:any, callback) 
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
        callback ( tmpEntries );
    }
    
    /**
     * 
     */
    static getDefaultSelectedDimensions ( componentDimensions ) : Object 
    {
        componentDimensions = $.parseJSON(JSON.stringify(componentDimensions));
        
        var result:Object = {};
    
        for ( var dimensionHashedUrl in componentDimensions ) {
            
            result [dimensionHashedUrl] = componentDimensions [dimensionHashedUrl];
            
            result [dimensionHashedUrl]["elements"] = [ result [dimensionHashedUrl].elements [0] ];
        }
        
        return result;
    }
}

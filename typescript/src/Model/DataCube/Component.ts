/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Represents a component which can be a dimension or a measure.
 */
class DataCube_Component {
    
    /**
     * Loads all component dimensions, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllDimensions (url, modelUrl, dsdUrl:string, dsUrl:string, callback) {
        
        $.ajax({
            url: url + "getcomponents", // CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: modelUrl, // CubeViz_Links_Module["modelUrl"],
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
    static prepareLoadedAllDimensions (entries:any, callback) {
        
        entries = JSON.parse (entries);
                                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        _.each(entries, function(component){
            // establish a new structure where the key is the label of the dimension
            tmpEntries[component.hashedUrl] = component;
        });
        
        // call callback function with prepared entries
        callback ( tmpEntries );
    }
    
    /**
     * Loads all component measures, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllMeasures (url, modelUrl, dsdUrl:string, dsUrl:string, callback) {
        
        $.ajax({
            url: url + "getcomponents", // CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: modelUrl, // CubeViz_Links_Module["modelUrl"],
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
    static prepareLoadedAllMeasures (entries:any, callback) {
        
        entries = JSON.parse (entries);        
                                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        // 
        _.each(entries, function(measure){         
            // establish a new structure where the key is the label of the dimension
            tmpEntries[measure.hashedUrl] = measure;
        });
        
        // call callback function with prepared entries
        callback ( tmpEntries );
    }
    
    /**
     * Creates a predefined collection of selected dimensions.
     * @param componentDimensions Object contain all component dimensions.
     * @return any Object containing hashed urls as properties and exactly one element.
     */
    static getDefaultSelectedDimensions ( componentDimensions ) : any 
    {        
        componentDimensions = $.parseJSON(JSON.stringify (componentDimensions));
        
        var result:any = {};
    
        _.each(componentDimensions, function(componentDimension, dimensionHashedUrl){            
            result[dimensionHashedUrl] = componentDimension;
            result[dimensionHashedUrl].elements = [componentDimension.elements [0]];
        });
        
        return result;
    }
}

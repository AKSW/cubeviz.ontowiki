/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

/**
 * Represents a component which can be a dimension or a measure.
 */
class Component {
    
    /**
     * Loads all components, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAllDimensions (dsdUrl, dsUrl, callback) {
        
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension" // possible: dimension, measure
            }
        }).done( function (entries) { 
            Component.prepareLoadedAllDimensions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedAllDimensions ( entries, callback ) {
                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        var tmpEntries = {};
        
        // 
        for ( var i in entries ) {            
            // establish a new structure where the key is the label of the dimension
            tmpEntries [ entries [i] ["label"] ] = entries [i];
        }
        
        // call callback function with prepared entries
        callback ( { "dimensions": tmpEntries } );
    }
    
    /**
     * 
     *
    static updateSelectedDimensionComponents (entries) {
        var tmpDimensionComponents = CubeViz_Links_Module.selectedDimensions;
        
        // if particular dimension was found, set elementCount 
        for ( var dimension in entries ) {    
            for ( var i in tmpDimensionComponents ) {
                
                if ( dimension == tmpDimensionComponents [i]["label"] ) {                    
                    tmpDimensionComponents [i]["elementCount"] = entries [ dimension ] ["length"];
                    tmpDimensionComponents [i]["selectedElementCount"] = CubeViz_Links_Module ["selectedDimensionComponents"] [ dimension ] ["length"];
                }
            }
        }
        
        // update global variable
        CubeViz_Links_Module.selectedDimensions = tmpDimensionComponents;
    }*/
}

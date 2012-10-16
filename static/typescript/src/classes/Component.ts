/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Component {
    
    /**
     * Loads all components, specified by model uri, data structure definition, dataset
     * and component type.
     */
    static loadAll (dsdUrl, dsUrl, callback) {
        $.ajax({
            url: CubeViz_Parameters_Module.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension" // possible: dimension, measure
            }
        }).done( function (entries) { 
            Component.prepareLoadedComponents (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedComponents ( entries, callback ) {
        
        console.log ( entries );
        
        // set standard values
        for ( var i in entries ) {
            entries [i].elementCount = entries [i].elementCount || 0;
            entries [i].selectedElementCount = entries [i].elementCount || 0;
        }
        
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        })
        
        // call callback function with prepared entries
        callback ( entries );
    }
    
    /**
     * 
     */
    static updateSelectedDimensionComponents (entries) {
        var tmpDimensionComponents = CubeViz_Parameters_Module.selectedDimensionComponents;
        
        // if particular dimension was found, set elementCount 
        for ( var dimension in entries ) {    
            for ( var i in tmpDimensionComponents ) {
                
                if ( dimension == tmpDimensionComponents [i]["label"] ) {                    
                    tmpDimensionComponents [i]["elementCount"] = entries [ dimension ] ["length"];
                }
            }
        }
        
        // update global variable
        CubeViz_Parameters_Module.selectedDimensionComponents = tmpDimensionComponents;
    }
}

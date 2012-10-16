/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataStructureDefinition {
    
    /**
     * result: JSON
     */
    static loadAll (callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Parameters_Module.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl
            }
        }).done( function (entries) { 
            DataStructureDefinition.prepareLoadedDataStructureDefinitions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedDataStructureDefinitions ( entries, callback ) {
        
        entries = $.parseJSON ( entries );
        
        // set standard values
        // nothing yet
        
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        
        // call callback function with prepared entries
        callback ( entries );
    }
}

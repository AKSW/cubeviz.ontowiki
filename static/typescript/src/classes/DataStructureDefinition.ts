/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataStructureDefinition {
    
    /**
     * result: JSON
     */
    static loadAll (callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Links_Module.modelUrl
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            System.out ( "DataStructureDefinition > loadAll > error" );
            System.out ( "response text: " + xhr.responseText );
            System.out ( "error: " + thrownError );
        })
        .done( function (entries) { 
            DataStructureDefinition.prepareLoadedDataStructureDefinitions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedDataStructureDefinitions ( entries, callback ) {
                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });
        
        // call callback function with prepared entries
        callback ( entries );
    }
}

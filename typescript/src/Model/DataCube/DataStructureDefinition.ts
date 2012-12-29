/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

declare var CubeViz_Links_Module: any;

class DataCube_DataStructureDefinition {
    
    /**
     * result: JSON
     */
    static loadAll (url, modelUrl, callback) {
        $.ajax({
            url: url + "getdatastructuredefinitions/",
            data: { m: modelUrl }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            console.log ( "DataStructureDefinition > loadAll > error" );
            console.log ( "response text: " + xhr ["responseText"] );
            console.log ( "error: " + thrownError );
        })
        .done( function (entries) { 
            DataCube_DataStructureDefinition.prepareLoadedDataStructureDefinitions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedDataStructureDefinitions ( entries, callback ) {
        
        entries = JSON.parse (entries);
                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a["label"].toUpperCase().localeCompare(b["label"].toUpperCase());
        });
        
        // call callback function with prepared entries
        callback ( entries );
    }
}

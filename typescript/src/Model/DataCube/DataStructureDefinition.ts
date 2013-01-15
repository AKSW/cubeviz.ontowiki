/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class DataCube_DataStructureDefinition {
    
    /**
     * @result JSON
     */
    static loadAll (url, modelUrl, callback) : void
    {
        $.ajax({
            url: url + "getdatastructuredefinitions/",
            data: { m: modelUrl }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "loadAll error: " + xhr.responseText );
        })
        .done( function (entries) { 
            DataCube_DataStructureDefinition.prepareLoadedDataStructureDefinitions (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedDataStructureDefinitions ( entries, callback ) : void
    {        
        entries = JSON.parse (entries);
                
        // sort objects by label, ascending
        entries.sort(function(a, b) {
           return a["label"].toUpperCase().localeCompare(b["label"].toUpperCase());
        });
        
        // call callback function with prepared entries
        callback ( entries );
    }
}

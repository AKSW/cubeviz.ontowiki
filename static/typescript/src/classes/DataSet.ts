/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataSet {
    
    /**
     * 
     */
    static loadAll (dsdUrl, callback) {
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Links_Module.modelUrl,
                dsdUrl: dsdUrl
            }
        }).done( function (entries) { 
            DataSet.prepareLoadedDataSets (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedDataSets ( entries, callback ) {
        
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

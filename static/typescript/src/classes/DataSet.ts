/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataSet {
    
    /**
     * 
     */
    static loadAll (dsdUrl, callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Parameters_Module.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl,
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

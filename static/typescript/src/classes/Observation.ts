/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Observation {
    
    /**
     * 
     */
    static loadAll (dsUrl, dimensions, callback) {

        $.ajax({
            type: "POST",
            url: CubeViz_Parameters_Module.cubevizPath + "getalldimensionselements/",
            data: {
                m: CubeViz_Parameters_Module.modelUrl,
                dsUrl: dsUrl,
                dimensions: dimensions
            }
        }).done( function (entries) { 
            Observation.prepareLoadedObservations (entries, callback); 
        });
    }
    
    /**
     * Set default values, sort objects by label etc.
     */
    static prepareLoadedObservations ( entries, callback ) {
        
        entries = $.parseJSON ( entries );
        
        // set standard values
        // nothing yet
        
        // sort objects by label, ascending
        /*entries.sort(function(a, b) {
           return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
        });*/
        
        // call callback function with prepared entries
        callback ( entries );
    }
}

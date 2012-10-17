/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Observation {
    
    /**
     * 
     */
    static loadAll (dsdUrl, dsUrl, callback) {
        
        $.ajax({
            url: CubeViz_Links_Module ["cubevizPath"] + "getresultobservations/",
            data: {
                m: CubeViz_Links_Module ["modelUrl"],
                lC: CubeViz_Links_Module ["linkCode"],
                sparqlEndpoint: "local"
            }
        }).done( function (entries) { 
            Observation.prepareLoadedResultObservations (entries, callback); 
        });
    }
    
    /**
     * 
     */
    static prepareLoadedResultObservations (entries, callback) {
        
        callback ( $.parseJSON ( entries ) );
    }
    
}

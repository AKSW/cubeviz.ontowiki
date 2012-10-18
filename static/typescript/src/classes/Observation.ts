/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Observation {
    
    /**
     * 
     */
    static loadAll (modelUrl:string, linkCode:string, sparqlEndpoint:string, callback) {
        
        $.ajax({
            url: CubeViz_Links_Module ["cubevizPath"] + "getresultobservations/",
            data: {
                m: modelUrl,
                lC: linkCode,
                sparqlEndpoint: sparqlEndpoint
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

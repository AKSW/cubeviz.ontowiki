/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_ConfigurationLink 
{        
    /**
     * Saves data or ui information to the server, usally in a file.
     * @param url Url to CubeViz
     * @param content Usally an object to save
     * @param type Determine if its "ui" or "data"
     * @param callback Function to call after saving is complete
     * @param useObservations bool False, if CubeViz has to get observations by 
     *                             itself, true, if it has to use your ones
     * @return void
     */
    static save (url:string, modelIri:string, content:any, type:string, callback, 
        useObservations:bool = false) : void
    {        
        // save current ajax setup
        var oldAjaxSetup = $.ajaxSetup(),
            oldSupportOrs = $.support.cors;
        
        // Setup ajax
        $.ajaxSetup({async: true, cache: false, type: "POST"}); 
        $.support.cors = true;
        
        // Execute Ajax 
        $.ajax({
            "url": url + "savecontenttofile/",
            "data": { 
                modelIri: modelIri,
                stringifiedContent: JSON.stringify(content),
                type: type,
                useObservations: true === useObservations ? "true" : "false"
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            
            throw new Error( "save error: " + xhr ["responseText"] );
        })
        .done(function (generatedHash){ 
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup); 
            $.support.cors = oldSupportOrs;
            
            callback(generatedHash);
        });
    }
}

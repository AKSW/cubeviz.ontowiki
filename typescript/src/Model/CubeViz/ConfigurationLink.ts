/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_ConfigurationLink 
{        
    /**
     * Saves data or ui information to the server, usally in a file.
     * @param url Url to CubeViz
     * @param content Usally an object to save
     * @param type Determine if its "ui" or "data"
     * @param callback Function to call after saving is complete
     * @return void
     */
    static save (url, content, type, callback) : void
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
            "data": { type: type, stringifiedContent: JSON.stringify(content) }
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
            
            callback(JSON.parse(generatedHash));
        });
    }
}

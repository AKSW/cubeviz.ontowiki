/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_ConfigurationLink 
{    
    /**
     * 
     */
    static saveToServer (url, data:any, ui:any, callback) : void
    {        
        // save current ajax setup
        var oldAjaxSetup = $.ajaxSetup(),
            oldSupportOrs = $.support.cors;
        
        // Setup ajax
        $.ajaxSetup({async: true, cache: false, type: "POST"}); 
        $.support.cors = true;
        
        // Execute Ajax 
        $.ajax({
            "url": url + "savelinktofile/",
            "data": { "data": data, "ui": ui }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            
            throw new Error( "saveToServerFile error: " + xhr ["responseText"] );
        })
        .done( function (result) { 
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup); 
            $.support.cors = oldSupportOrs;
            
            callback ( JSON.parse(result) );
        });
    }
}

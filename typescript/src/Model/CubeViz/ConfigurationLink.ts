/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_ConfigurationLink 
{        
    /**
     * Saves data information to the server, usally in a file.
     * @param url string Url to CubeViz
     * @param serviceUrl string The current service url, if available
     * @param modelIri string Current selected model
     * @param hash string MD5 hash over content
     * @param content any Object to save
     * @param callback Function to call after saving is complete
     * @param useObservations bool False, if CubeViz has to get observations by 
     *                             itself, true, if it has to use your ones
     * @return void
     */
    static saveData (url:string, serviceUrl:string, modelIri:string, hash:string, content:any, callback, 
        useObservations:bool = false) : void
    {        
        // save current ajax setup
        var oldAjaxSetup:any = $.ajaxSetup(),
            oldSupportOrs:any = $.support.cors,            
            stringifiedContent:string = JSON.stringify(content);
        
        // Setup ajax
        $.ajaxSetup({async: true, cache: false, type: "POST"}); 
        $.support.cors = true;
        
        // Execute Ajax 
        $.ajax({
            url: url + "savecontenttofile/",
            data: { 
                // Hash to be used as filename for ObjectCache entry
                hash: hash,
                
                modelIri: modelIri,
                serviceUrl: serviceUrl,
                stringifiedContent: stringifiedContent,
                type: "data",
                
                // If true, CubeViz uses the given observations instead of
                // quering the store
                useObservations: true === useObservations ? "true" : "false"
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            
            throw new Error( "save error: " + xhr ["responseText"] );
        })
        .done(function (result){ 
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup); 
            $.support.cors = oldSupportOrs;
            
            callback();
        });
    }
    
    /**
     * Saves ui information to the server, usally in a file.
     * @param url string Url to CubeViz
     * @param serviceUrl string The current service url, if available
     * @param modelIri string Current selected model
     * @param hash string MD5 hash over content
     * @param content any Object to save
     * @param callback Function to call after saving is complete
     * @return void
     */
    static saveUI (url:string, serviceUrl:string, modelIri:string, hash:string, content:any, callback) : void
    {        
        // save current ajax setup
        var oldAjaxSetup:any = $.ajaxSetup(),
            oldSupportOrs:any = $.support.cors,
            stringifiedContent:string = JSON.stringify(content);
        
        // Setup ajax
        $.ajaxSetup({async: true, cache: false, type: "POST"}); 
        $.support.cors = true;
        
        // Execute Ajax 
        $.ajax({
            url: url + "savecontenttofile/",
            data: { 
                // Hash to be used as filename for ObjectCache entry
                hash: hash,
                
                modelIri: modelIri,
                stringifiedContent: JSON.stringify(content),
                type: "ui"
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup);
            $.support.cors = oldSupportOrs;
            
            throw new Error( "save error: " + xhr ["responseText"] );
        })
        .done(function (result){ 
            
            // set old ajax config
            $.ajaxSetup(oldAjaxSetup); 
            $.support.cors = oldSupportOrs;
            
            callback();
        });
    }
}

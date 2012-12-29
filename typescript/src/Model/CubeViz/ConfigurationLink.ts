/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_ConfigurationLink {
    
    /**
     * 
     */
    static saveToServerFile (url, cubeVizLinksModule:Object, cubeVizUIChartConfig:Object, callback) {
        
        // Setup Ajax
        $.ajaxSetup({"async": true, "cache": false, "type": "POST"}); 
        $.support.cors = true;
        
        // Execute Ajax 
        $.ajax({
            url: url + "savelinktofile/",
            data: {
                "cubeVizLinksModule": cubeVizLinksModule,
                "cubeVizUIChartConfig": cubeVizUIChartConfig
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            throw new Error( "saveToServerFile error: " + xhr ["responseText"] );
        })
        .done( function (result) { 
            callback ( JSON.parse(result) );
        });
    }
}

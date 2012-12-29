/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

class CubeViz_ConfigurationLink {
    
    /**
     * 
     */
    static saveToServerFile (cubeVizLinksModule:Object, cubeVizUIChartConfig:Object, callback) {
        
        // Setup Ajax
        $.ajaxSetup({"async": true, "cache": false, "type": "POST"}); 
        $.support.cors = true;
        
        // Execute Ajax 
        $.ajax({
            url: CubeViz_Links_Module.cubevizPath + "savelinktofile/",
            data: {
                "cubeVizLinksModule": cubeVizLinksModule,
                "cubeVizUIChartConfig": cubeVizUIChartConfig
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            console.log ( "ConfigurationLink > loadAll > error" );
            console.log ( "response text: " + xhr.responseText );
            console.log ( "error: " + thrownError );
        })
        .done( function (result) { 
            callback ( JSON.parse(result) );
        });
    }
}

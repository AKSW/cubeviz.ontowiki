/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class ConfigurationLink {
    
    /**
     * 
     */
    static saveToServerFile (cubeVizLinksModule:Object, cubeVizUIChartConfig:Object, callback) {
        $.ajax({
            url: CubeViz_Links_Module ["cubevizPath"] + "savelinktofile/",
            data: {
                "cubeVizLinksModule": cubeVizLinksModule,
                "cubeVizUIChartConfig": cubeVizUIChartConfig
            }
        })
        .error( function (xhr, ajaxOptions, thrownError) {
            System.out ( "ConfigurationLink > loadAll > error" );
            System.out ( "response text: " + xhr.responseText );
            System.out ( "error: " + thrownError );
        })
        .done( function (result) { 
            callback ( result );
        });
    }
}

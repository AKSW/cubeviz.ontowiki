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
        }).
        error( function (result) { 
            System.out ( result.responseText );
        })
        .done( function (result) { 
            callback ( result );
        });
    }
}

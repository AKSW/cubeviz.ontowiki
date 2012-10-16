/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class DataSet {
    
    /**
     * 
     */
    static loadAll (dsdUrl, callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getdatasets/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsdUrl: dsdUrl
            }
        }).done( callback );
    }
}

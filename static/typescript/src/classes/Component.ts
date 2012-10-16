/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Component {
    
    /**
     * 
     */
    static loadAll (dsdUrl, dsUrl, callback) {
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getcomponents/",
            data: {
                m: CubeViz_Config.selectedModel,
                dsdUrl: dsdUrl,
                dsUrl: dsUrl,
                cT: "dimension" // dimension, measure
            }
        }).done( callback );
    }
}

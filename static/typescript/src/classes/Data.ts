/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Data {
    
    /**
     * 
     */
    static loadDataStructureDefinitions (callback) {
        
        $.ajax({
            type: "POST",
            url: CubeViz_Config.cubevizPath + "getdatastructuredefinitions/",
            data: {
                m: CubeViz_Config.selectedModel
            }
        }).done( callback );
    }
}

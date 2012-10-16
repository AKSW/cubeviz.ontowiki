/// <reference path="DeclarationSourceFiles\jquery.d.ts" />

var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var CubeViz_Config = CubeViz_Config || {};


$(document).ready(function(){
    Module_Event.ready ();
});

class Module_Event {
    /**
     * After document is ready
     */
    static ready () {
        System.out ( "" );
        System.out ( "CubeViz_Parameters_Component:" );
        System.out ( CubeViz_Parameters_Component );
        System.out ( "" );
        System.out ( "CubeViz_Links_Module:" );
        System.out ( CubeViz_Links_Module );
        System.out ( "" );
        System.out ( "CubeViz_Link_Chosen_Module:" );
        System.out ( CubeViz_Link_Chosen_Module );
        
        Data.loadDataStructureDefinitions (Module_Event.onComplete_DataStructureDefinitions);
    }
    
    /**
     * 
     */
    static onComplete_DataStructureDefinitions (response) {
        System.out ( response );
    }
}

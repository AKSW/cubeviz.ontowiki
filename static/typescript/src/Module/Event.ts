/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

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
        System.out ( "" );
        
        /**
         * Setup User Interface
         */
         
        /**
         * Selectbox with data structure definitions
         */
        Module_Event.setupDataStructureDefinitionBox ();
    }
    
    /**
     * EVENTS
     */
     
    /**
     * 
     */
    static onComplete_LoadDataSets (options) {
        options = $.parseJSON ( options );
        console.log ( options );
        var entry = null;
        
        $("#sidebar-left-data-selection-sets").empty ();
        
        for ( var i in options ) {
            entry = $("<option value=\"" + options [i].url +"\">" + options [i].label + "</option>");            
            $("#sidebar-left-data-selection-sets").append ( entry );
        }
    }
     
    /**
     * 
     */
    static onComplete_LoadDataStructureDefinitions (options) {
        
        options = $.parseJSON ( options );
        
        /**
         * Build select box
         */
        Module_Main.buildDataStructureDefinitionBox (options);
        
        // if at least one data structure definition, than load data sets for first one
        if ( 1 <= options.length ) {
            DataSet.loadAll ( options [0].url, Module_Event.onComplete_LoadDataSets );
        }
    }
    
    /**
     * SETUP FUNCTIONS
     */
    
    /**
     * 
     */
    static setupDataStructureDefinitionBox () {
        DataStructureDefinition.loadAll (Module_Event.onComplete_LoadDataStructureDefinitions);
    }
}

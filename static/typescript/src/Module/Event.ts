/**
 * Declaration Source Files
 */ 
/// <reference path="..\DeclarationSourceFiles\jsontemplate.d.ts" />
/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />


/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {};
var CubeViz_Parameters_Module = CubeViz_Parameters_Module || {};


/**
 * Event section
 */
$(document).ready(function(){
    Module_Event.ready ();
});

class Module_Event {
    /**
     * After document is ready
     */
    static ready () {
        /*System.out ( "" );
        System.out ( "CubeViz_Parameters_Component:" );
        System.out ( CubeViz_Parameters_Component );
        System.out ( "" );
        System.out ( "CubeViz_Links_Module:" );
        System.out ( CubeViz_Links_Module );
        System.out ( "" );
        System.out ( "CubeViz_Link_Chosen_Module:" );
        System.out ( CubeViz_Link_Chosen_Module );
        System.out ( "" );*/
        
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
    static onComplete_LoadComponents (entries) {
        entries = $.parseJSON (entries);
        
        /**
         * Build select box
         */
        Module_Main.buildComponentSelection (entries);
    }
     
    /**
     * 
     */
    static onComplete_LoadDataSets (entries) {
        var dataSets:any = $.parseJSON (entries);
        
        /**
         * Build select box
         */
        Module_Main.buildDataSetBox (dataSets);
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == dataSets.length ) {
            // todo: handle case that no data sets were loaded
            
        } else if ( 1 <= dataSets.length ) {
            
            CubeViz_Parameters_Module.selectedDS = dataSets [0].url;
            
            // loaded components for certain data structure definition and data set
            Component.loadAll ( CubeViz_Parameters_Module.selectedDSD.url, dataSets [0].url, 
                Module_Event.onComplete_LoadComponents 
            );
        }
    }
     
    /**
     * 
     */
    static onComplete_LoadDataStructureDefinitions (entries) {
        
        entries = $.parseJSON ( entries );
        
        /**
         * Build select box
         */
        Module_Main.buildDataStructureDefinitionBox (entries);
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == entries.length ) {
            // todo: handle case that no data structure definition were loaded
            
        } else if ( 1 <= entries.length ) {
            
            // default: set first selected data structure definition
            CubeViz_Parameters_Module.selectedDSD = entries [0];
            
            // if more than one data structure definition, load for the first one its data sets
            DataSet.loadAll ( entries [0].url, Module_Event.onComplete_LoadDataSets );
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

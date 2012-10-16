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

// templates
var CubeViz_Dialog_Template = CubeViz_Dialog_Template || {};
var CubeViz_Dimension_Template = CubeViz_Dimension_Template || {};


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
         * Selectbox with data set
         */
        Module_Event.setupDataSetBox ();
         
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
    static onClick_DialogSelector () {
        
        // get dimension from clicked dialog selector
        var dimension:string = $(this).attr ( "dimension" ).toString ();
        
        // 
        Module_Main.buildDimensionDialog (dimension, CubeViz_Parameters_Module.loadedObservations);
        
        /**
         * Setup dialog selector close button ( id="dialog-btn-close-{dimension}" )
         */
        Module_Event.setupDialogSelectorCloseButton (dimension);
    }
     
    /**
     * 
     */
    static onClick_DialogSelectorCloseButton () {
        
        // get dimension from clicked dialog selector
        var dimension:string = $(this).attr ( "dimension" ).toString ();
        
        // ...
        
        // clean content of shown dialog box
        $("#dimensionDialogContainer").fadeOut (500).html ("");
    }
    
    /**
     * 
     */
    static onComplete_LoadComponents (entries) {
        
        /**
         * Build select box
         */
        Module_Main.buildComponentSelection (entries);
        
        CubeViz_Parameters_Module.selectedDimensionComponents = entries;
        
        if ( 0 == entries.length ) {
            
        } else if ( 1 <= entries.length ) {
            
            Observation.loadAll ( CubeViz_Parameters_Module.selectedDS.url, 
                CubeViz_Parameters_Module.selectedDimensionComponents, 
                Module_Event.onComplete_LoadObservations );
        }
    }
    
    /**
     * 
     */
    static onComplete_LoadObservations (entries) {
        
        /**
         * Save loaded observations
         */
        CubeViz_Parameters_Module.loadedObservations = entries;
        
        /**
         * Update CubeViz_Parameters_Module.selectedDimensionComponents with new entries
         */
        Component.updateSelectedDimensionComponents ( entries );
        
        /**
         * Update component selection
         */
        Module_Main.buildComponentSelection ( CubeViz_Parameters_Module.selectedDimensionComponents );
        
        /**
         * Dimensions button to select / unselect elements
         */
        Module_Event.setupDialogSelector ();
    }
     
    /**
     * 
     */
    static onChange_DataStructureDefinitionBox () {
        
        // extract value and label from selected data structure definition
        var selectedElement:any = $($("#sidebar-left-data-selection-strc option:selected") [0]),
            dsdLabel:string = selectedElement.text (),
            dsdUrl:string = selectedElement.attr ("value");
        
        // set new selected data structure definition
        CubeViz_Parameters_Module.selectedDSD = { "label": dsdLabel, "url": dsdUrl};
        
        // re-load data set box
        DataSet.loadAll ( dsdUrl, Module_Event.onComplete_LoadDataSets );
    }
     
    /**
     * 
     */
    static onChange_DataSetBox () {
        
        // extract value and label from selected data structure definition
        var selectedElement:any = $($("#sidebar-left-data-selection-sets option:selected") [0]),
            dsLabel:string = selectedElement.text (),
            dsUrl:string = selectedElement.attr ("value");
        
        // set new selected data set
        CubeViz_Parameters_Module.selectedDS = { "label": dsLabel, "url": dsUrl};
        
        // re-load data set box
        Component.loadAll ( CubeViz_Parameters_Module.selectedDSD.url, dsUrl, 
            Module_Event.onComplete_LoadComponents );
    }
     
    /**
     * 
     */
    static onComplete_LoadDataSets (entries) {
        /**
         * Build select box
         */
        Module_Main.buildDataSetBox (entries);
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == entries.length ) {
            // todo: handle case that no data sets were loaded
            CubeViz_Parameters_Module.selectedDS = {};
            
        } else if ( 1 <= entries.length ) {
            
            CubeViz_Parameters_Module.selectedDS = entries [0];
            
            // loaded components for certain data structure definition and data set
            Component.loadAll ( CubeViz_Parameters_Module.selectedDSD.url, entries [0].url, 
                Module_Event.onComplete_LoadComponents 
            );
        }
    }
     
    /**
     * 
     */
    static onComplete_LoadDataStructureDefinitions (entries) {
        
        /**
         * Build select box
         */
        Module_Main.buildDataStructureDefinitionBox (entries);
        
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == entries.length ) {
            // todo: handle case that no data structure definition were loaded
            
            CubeViz_Parameters_Module.selectedDSD = {};
            
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
        
        // set event for onChange
        $("#sidebar-left-data-selection-strc").change ( Module_Event.onChange_DataStructureDefinitionBox );
    }
    
    /**
     * 
     */
    static setupDataSetBox () {
        
        // set event for onChange
        $("#sidebar-left-data-selection-sets").change ( Module_Event.onChange_DataSetBox );
    }
    
    /**
     * 
     */
    static setupDialogSelector () {
        
        // set event for onChange
        $(".open-dialog-selector").click (Module_Event.onClick_DialogSelector);
    }
    
    /**
     * 
     */
    static setupDialogSelectorCloseButton (dimension:string) {
        
        // set event for onChange
        $("#dialog-btn-close-" + dimension ).click (Module_Event.onClick_DialogSelectorCloseButton);
    }
}
